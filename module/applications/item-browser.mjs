const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
import { DieseldrachenItem } from "../documents/item.mjs";

export class DieseldrachenItemBrowser extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
        super(options);

        this.items = [];
        this.compendiumPackKey = "dieseldrachen-kompendium.pack-inventar";
        this.fieldFilter = [];
        this.selectedCategory = null;
        this.selectedMenu = { path: [], data: null };
        this.currentActor = options.actor;
        this.searchTerm = "";
        //this.config = CONFIG.DH.ITEMBROWSER.compendiumConfig;
        //this.presets = options.presets;

        this.compendiumPack = game.packs.get(this.compendiumPackKey);

        console.log(game);
    }

    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
        id: 'itemBrowser',
        classes: ['dieseldrachen', 'dialog', 'compendium-browser'],
        tag: 'div',
        window: {
            frame: true,
            title: 'Itembrowser',
            icon: 'fa-solid fa-book-atlas',
            positioned: true,
            resizable: true
        },
        actions: {
        },
        position: {
            left: 100,
            width: 900,
            height: 600
        },
        actions: {
            clickCategory: this.#handleClickCategory,
            addItem: this.#handleAddItem
        }
    };

    /** @override */
    static PARTS = {
        sidebar: {
            template: 'systems/dieseldrachen-vtt/templates/dialogs/item-browser-sidebar.hbs'
        },
        list: {
            template: 'systems/dieseldrachen-vtt/templates/dialogs/item-browser.hbs',
            scrollable: ['scrollable']
        }
    };

    static async #handleAddItem(event, target) {
        event.preventDefault();
        const itemId = target.dataset.itemUuid;

        const item = await foundry.utils.fromUuid(itemId);

        const proceed = await foundry.applications.api.DialogV2.confirm({
            content: `Möchtest Du [${item.name}] dem Charakter hinzufügen?`,
            rejectClose: false,
            modal: true
        });
        if (proceed) {

            const itemData = {
                name: item.name,
                img: item.img,
                type: item.type,
                system: duplicate(item.system)
            };

            await DieseldrachenItem.create(itemData, { parent: this.currentActor });
        }
    }

    static async #handleClickCategory(event, target) {
        this.selectedCategory = target.dataset.category;
        this.searchTerm = "";
        this.items = await this.collectItems(this.selectedCategory);
        this.render({ force: true });
    }

    /* @inheritDoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.items = this.items;
        context.selectedCategory = this.selectedCategory;
        context.searchTerm = this.searchTerm;
        return context;
    }

    async collectItems(type) {

        let tempItems = [];
        if (this.compendiumPack !== undefined) {
            tempItems = await this.compendiumPack.getDocuments({ type__in: [this.selectedCategory] });
        }


        game.items.forEach(item => {
            if (item.type === this.selectedCategory) {
                tempItems.push(item);
            }
        });

        console.log("suche: " + this.searchTerm);
        if (this.searchTerm.length > 0) {
            tempItems = await tempItems.filter(item => {
                return item.name.toLowerCase().includes(this.searchTerm.toLowerCase());
            });
            console.log(tempItems);
        }


        return DieseldrachenItemBrowser.sortBy(tempItems, "name");
    }

    static sortBy(data, property) {
        return data.sort((a, b) => (a[property] > b[property] ? 1 : -1));
    }

    /** @inheritDoc */
    _onRender(context, options) {


        const searchInput = this.element.querySelector(".search-input"); // .querySelectorAll('.item-editable-stat')
        searchInput.addEventListener("change", event => this.handleSearchFilterChanged(event))
    }

    async handleSearchFilterChanged(event) {
        const input = event.currentTarget;
        this.searchTerm = input.value.trim();
        this.items = await this.collectItems(this.selectedCategory);
        this.render({ force: true });
    }
}