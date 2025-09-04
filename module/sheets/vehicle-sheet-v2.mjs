import { DieseldrachenActorSheetV2 } from "./actor-sheet-v2.mjs"

export class DieselDrachenVehicleActorSheetV2 extends DieseldrachenActorSheetV2 {
    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
        position: {
            height: 1000,
            width: 800
        },
        actions: {
            setVehicleSpeed: this.#handleVehicleSpeed,
            setMotorDamage: this.#handleMotorDamage,
            setTireWingDamage: this.#handleTireWingDamage
        }
    }

    /** @inheritDoc */
    static PARTS = {
        form: {
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/actor-partial-vehicle.html'
        },
        tabs: {
            // Foundry-provided generic template
            template: 'templates/generic/tab-navigation.hbs',
            // classes: ['sysclass'], // Optionally add extra classes to the part for extra customization
        },
        weapons: {
            id: 'weapons',
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/vehicle/tab-weapons.hbs',
            scrollable: ['scrollable'],
        },
        upgrades: {
            id: 'upgrades',
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/vehicle/tab-upgrades.hbs',
            scrollable: ['scrollable'],
        },
        items: {
            id: 'items',
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/vehicle/tab-items.hbs',
            scrollable: ['scrollable'],
        },
        biography: {
            id: 'biography',
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/character/tab-biography.html',
            scrollable: [''],
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
                    { id: 'weapons', group: 'sheet', label: 'Geschütze' },
                    { id: 'upgrades', group: 'sheet', label: 'Umbauten' },
                    { id: 'items', group: 'sheet', label: 'Fracht' },
                    { id: 'biography', group: 'sheet', label: 'Beschreibung' }
                ],
            initial: 'weapons'
        }
    }

    /** @override */
    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        let healthbar = this._buildHealthBarContext();

        foundry.utils.mergeObject(context, {
            healthbar_segments: healthbar
        });

        let items = this._prepareItems();
        foundry.utils.mergeObject(context, { vehicleUpgrades: items.vehicleUpgrades, vehicleWeapons: items.vehicleWeapons, gear: items.gear });
        return context;
    }

    _prepareItems() {
        const vehicleUpgrades = [];
        const vehicleWeapons = [];
        const gear = [];

        let inventory = this.options.document.items;
        for (let i of inventory) {

            if (i.type === 'vehicleUpgrade') {
                vehicleUpgrades.push(i);
            }
            else if (i.type === 'vehicleWeapon') {
                vehicleWeapons.push(i);
            }
            else if (i.type === 'item') {
                gear.push(i);
            }
        }

        return { vehicleUpgrades: vehicleUpgrades, vehicleWeapons: vehicleWeapons, gear: gear };
    }

    static async #handleVehicleSpeed(event, target) {
        const value = parseInt(target.dataset.value);
        const unused = parseInt(target.dataset.unused);
        const name = 'system.speed.value';


        if (unused == 1) {
            return;
        }


        let t = parseInt(foundry.utils.getProperty(this.actor, name));
        if (t === 1 && value === 1) {
            this.actor.update({ [name]: 0 });
        } else {
            this.actor.update({ [name]: value });
        }
    }

    static async #handleMotorDamage(event, target) {
        const value = parseInt(target.dataset.value);
        const unused = parseInt(target.dataset.unused);
        const name = 'system.motors.damage';

        if (unused == 1) {
            return;
        }

        let t = parseInt(foundry.utils.getProperty(this.actor, name));
        if (t === 1 && value === 1) {
            this.actor.update({ [name]: 0 });
        } else {
            this.actor.update({ [name]: value });
        }
    }

    static async #handleTireWingDamage(event, target) {
        const value = parseInt(target.dataset.value);
        const unused = parseInt(target.dataset.unused);
        const name = 'system.tireWing';

        let t = parseInt(foundry.utils.getProperty(this.actor, name));
        if (t === 1 && value === 1) {
            this.actor.update({ [name]: 0 });
        } else {
            this.actor.update({ [name]: value });
        }
    }
}

