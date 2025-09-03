import { DieseldrachenActorSheetV2 } from "./actor-sheet-v2.mjs"

export class DieselDrachenVehicleActorSheetV2 extends DieseldrachenActorSheetV2 {
    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
        position: {
            height: 900,
            width: 700
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

