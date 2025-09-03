const { ActorSheetV2 } = foundry.applications.sheets
const { HandlebarsApplicationMixin } = foundry.applications.api
const { TextEditor, DragDrop } = foundry.applications.ux
import { rollDialogSkillV1, rollDialogRangedWeaponV1, rollDialogMeleeWeaponV1 } from "../roll_dialog.mjs"
import { DieseldrachenItem } from '../documents/item.mjs';

export class DieseldrachenActorSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {
    #dragDrop // Private field to hold dragDrop handlers

    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
        classes: ['dieseldrachen', 'sheet', 'actor'],
        tag: 'form',
        position: {
            width: 555,
            height: 450
        },
        actions: {
            createItem: this.#handleCreateItem,
            editItem: this.#handleEditItem,
            deleteItem: this.#handleDeleteItem,
            rangedWeaponRoll: this.#handleRangedWeaponRoll,
            meleeWeaponRoll: this.#handleMeleeWeaponRoll,
            clickWeaponReload: this.#handleReloadWeapon,
            clickHealthBarReset: this.#handleHealthBarReset,
            clickedDiceSelection: this.#handleClickDiceSelection
        },
        form: {
            // handler: DCCActorSheet.#onSubmitForm,
            submitOnChange: true
        },
        actor: {
            type: 'npc'
        },
        dragDrop: [{
            dragSelector: '[data-drag="true"]',
            dropSelector: '.dieseldrachen.actor'
        }],
        window: {
            resizable: true,
            controls: [
            ]
        }
    }

    /** @inheritDoc */
    static PARTS = {
        tabs: {
            id: 'tabs',
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/actor-partial-tabs.html'
        },
        character: {
            id: 'character',
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/actor-partial-npc-common.html'
        }
    }

    /**
   * Define the structure of tabs used by this sheet.
   * @type {Record<string, ApplicationTabsConfiguration>}
   */
    static TABS = {
        sheet: { // this is the group name
            tabs:
                [
                    { id: 'character', group: 'sheet', label: 'DCC.Character' },
                ],
            initial: 'character'
        }
    }

    constructor(options = {}) {
        super(options)
        this.#dragDrop = this.#createDragDropHandlers()
    }

    /* @inheritDoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options)
        const actorData = this.document.toPlainObject();

        context.system = actorData.system;
        context.flags = actorData.flags;
        context.actor = this.document;

        // Adding a pointer to CONFIG.DIESELDRACHEN
        context.config = CONFIG.DIESELDRACHEN;

        context.biographyHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            this.document.system.biography,
            {
                // Whether to show secret blocks in the finished html
                secrets: this.document.isOwner,
                // Necessary in v11, can be removed in v12
                async: true,
                // Data to fill in for inline rolls
                rollData: this.document.getRollData(),
                // Relative UUID resolution
                relativeTo: this.document,
            }
        );
        return context;
    }

    /** @inheritDoc */
    _onRender(context, options) {
        this.#dragDrop.forEach((d) => d.bind(this.element))

        const itemEditableStatsElements = this.element.querySelectorAll('.item-editable-stat')
        for (const input of itemEditableStatsElements) {
            input.addEventListener("change", event => this.handleItemStatChanged(event))
        }

        const healthbarSegments = this.element.querySelectorAll('.healthbar-segment');
        for (const segment of healthbarSegments) {
            segment.addEventListener("click", event => this.handleClickHealthbarSegmentNormalDamage(event));
            segment.addEventListener("contextmenu", event => this.handleClickHealthbarSegmentElementDamage(event));
        }
    }

    /** @override */
    async _processSubmitData(event, form, formData) {
        // Process the actor data normally
        const result = await super._processSubmitData(event, form, formData)
        return result
    }

    _buildHealthBarContext() {
        let numSegments = 33;

        if (this.document.type == "npc") {
            numSegments = this.document.system.health.max + 1;
        }

        let result = new Array(numSegments);

        let json_data = JSON.parse(this.document.system.healthbar || "[]");
        for (let i = 0; i < numSegments; i++) {
            result[i] = { sign: json_data[i], value: i, index: i, css_class: "" };

            if (this.document.system.health.max >= i) {
                result[i].css_class = 'green';
            } else {
                result[i].css_class = 'unused';
            }
        }
        return result;
    }

    /**
   * Handle increasing disapproval
   @this {DieseldrachenActorSheetV2}
   @param {PointerEvent} event   The originating click event
   @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   @returns {Promise<void>}
   **/
    static async handleSkillRoll(event, target, actor) {
        event.preventDefault()

        rollDialogSkillV1(actor, target.dataset.roll, target.dataset.label, target.dataset.rollModDice);
    }

    static async #handleClickDiceSelection(event, target) {
        const input = target;
        let value = parseInt(input.dataset.value);
        const name = input.dataset.name;

        if (this.actor.system.locked == true) {
            return;
        }

        let t = foundry.utils.getProperty(this.actor, name);
        if (t == value) {
            // resetting
            this.actor.update({ [name]: 0 });
            value = 0
        } else {
            this.actor.update({ [name]: value });
        }

        let i18n_k = game.i18n.localize(`DIESELDRACHEN.Keys.${name}`);
        let msg = game.i18n.format("DIESELDRACHEN.Messages.ChangedDice", { key: i18n_k, value: value, old_value: t });


        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: msg
        });
    }

    async handleClickHealthbarSegmentNormalDamage(event) {
        const segment = event.currentTarget;
        let json_data = JSON.parse(this.actor.system.healthbar || "[]");
        if (json_data[segment.dataset.healthvalue] == 'X') {
            json_data[segment.dataset.healthvalue] = '';
        } else {
            json_data[segment.dataset.healthvalue] = 'X';
        }

        this.actor.update({ ['system.healthbar']: JSON.stringify(json_data) });
    }

    async handleClickHealthbarSegmentElementDamage(event) {
        const segment = event.currentTarget;
        let json_data = JSON.parse(this.actor.system.healthbar || "[]");
        if (json_data[segment.dataset.healthvalue] == '/') {
            json_data[segment.dataset.healthvalue] = '';
        } else {
            json_data[segment.dataset.healthvalue] = '/';
        }

        this.actor.update({ ['system.healthbar']: JSON.stringify(json_data) });
    }

    async handleItemStatChanged(ev) {
        const li = $(ev.currentTarget).parents('.item');
        const item = this.actor.items.get(li.data('itemId'));

        if (ev.target.type === 'checkbox') {
            item.update({ [ev.target.dataset.itemStat]: ev.target.checked });
        } else {
            item.update({ [ev.target.dataset.itemStat]: ev.target.value });
        }
    }

    static async #handleMeleeWeaponRoll(event, target) {
        event.preventDefault();
        const itemId = target.closest('.item').dataset.itemId;
        const dataset = target.closest('.item').dataset;
        rollDialogMeleeWeaponV1(this.actor, itemId, dataset.label);
    }

    static async #handleRangedWeaponRoll(event, target) {
        event.preventDefault();
        const dataset = target.closest('.item').dataset;
        const itemId = target.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);

        if (item.system.bullets.value == 0) {
            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: `Waffe ${item.name} hat keine Munition mehr. Kugeln: ${item.system.bullets.value}`
            });
        } else {
            rollDialogRangedWeaponV1(this.actor, itemId, dataset.label);
        }
    }

    static async #handleReloadWeapon(event, target) {
        const item = this.actor.items.get($(target).data('itemId'));
        if (item.system.bullets.value == item.system.bullets.max) {
            return;
        }

        const proceed = await foundry.applications.api.DialogV2.confirm({
            content: `${item.name} nachladen?`,
            rejectClose: false,
            modal: true
        });
        if (proceed) {
            let t = parseInt(item.system.bullets.value) + parseInt(item.system.bullets.perReload);
            if (t > item.system.bullets.max) {
                t = item.system.bullets.max;
            }
            item.update({ ['system.bullets.value']: t });

            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: `Waffe ${item.name} wurde für ${item.system.bullets.perReload} Kugel(n) nachgeladen. Aktuelle Schusszahl: ${t}`
            });
        }
    }

    static async #handleDeleteItem(event, target) {
        const li = $(target).parents('.item');
        const item = this.actor.items.get(li.data('itemId'));
        item.delete();
        li.slideUp(200, () => this.render(false));
    }

    static async #handleEditItem(event, target) {
        event.preventDefault();
        const li = $(target).parents('.item');
        const item = this.actor.items.get(li.data('itemId'));
        item.sheet.render(true);
    }

    static async #handleCreateItem(event, target) {
        event.preventDefault();
        const actor = this.actor;
        this._onItemCreate(event, target, actor);
    }

    static async #handleHealthBarReset(event, target) {
        event.preventDefault();
        const proceed = await foundry.applications.api.DialogV2.confirm({
            content: "Die Lebensleiste zurücksetzen?",
            rejectClose: false,
            modal: true
        });
        if (proceed) {
            let json_data = [];
            this.actor.update({ ['system.healthbar']: JSON.stringify(json_data) });
            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: "Lebensleiste wurde zurückgesetzt."
            });
        }

    }

    async _onItemCreate(event, target, actor) {
        event.preventDefault();

        // Get the type of item to create.
        const type = target.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(target.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.

        const itemData = {
            name: name,
            type: type,
            system: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.system['type'];

        // Finally, create the item!
        return await DieseldrachenItem.create(itemData, { parent: actor });
    }

    /**
  * Create drag-and-drop workflow handlers for this Application
  * @returns {DragDrop[]} An array of DragDrop handlers
  * @private
  */
    #createDragDropHandlers() {
        return this.options.dragDrop.map((d) => {
            d.permissions = {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this)
            }
            d.callbacks = {
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this)
            }
            return new DragDrop(d)
        })
    }

    /**
     * Define whether a user is able to begin a dragstart workflow for a given drag selector
     * @param {string} selector       The candidate HTML selector for dragging
     * @returns {boolean}             Can the current user drag this selector?
     * @protected
     */
    _canDragStart(selector) {
        // game.user fetches the current user
        return this.isEditable;
    }


    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
     * @param {string} selector       The candidate HTML selector for the drop target
     * @returns {boolean}             Can the current user drop on this selector?
     * @protected
     */
    _canDragDrop(selector) {
        // game.user fetches the current user
        return this.isEditable;
    }


    /**
     * Callback actions which occur at the beginning of a drag start workflow.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragStart(event) {
        const el = event.currentTarget;
        if ('link' in event.target.dataset) return;

        // Extract the data you need
        let dragData = null;

        if (!dragData) return;

        // Set data transfer
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }


    /**
     * Callback actions which occur when a dragged element is over a drop target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragOver(event) { }


    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    async _onDrop(event) {
        const data = TextEditor.getDragEventData(event);

        //console.log(data.type);
        // Handle different data types
        switch (data.type) {
            // write your cases
        }

        return super._onDrop?.(event);
    }
}