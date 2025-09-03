import { DieseldrachenActorSheetV2 } from "./actor-sheet-v2.mjs"

export class DieselDrachenNpcActorSheetV2 extends DieseldrachenActorSheetV2 {
    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
        position: {
            height: 900,
            width: 700
        },
        actions: {
            skillRoll: this.#skillRoll,
        }
    }

    /** @inheritDoc */
    static PARTS = {
        form: {
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/actor-partial-npc.html'
        },
        description: {
            id: 'description',
            template: 'systems/dieseldrachen-vtt/templates/v2/partial-biography.html'
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
        foundry.utils.mergeObject(context, { npcSpecialDice: items.npcSpecialDice, meleeWeapons: items.meleeWeapons, rangedWeapons: items.rangedWeapons });
        return context;
    }

    _prepareItems() {
        const npcSpecialDice = [];
        const rangedWeapons = [];
        const meleeWeapons = [];

        let inventory = this.options.document.items;
        for (let i of inventory) {
            if (i.type === 'npcSpecialDice') {
                npcSpecialDice.push(i);
            }
            else if (i.type === 'meleeWeapon') {
                meleeWeapons.push(i);

            }
            else if (i.type === 'rangedWeapon') {
                rangedWeapons.push(i);

            }
        }

        return { npcSpecialDice: npcSpecialDice, meleeWeapons: meleeWeapons, rangedWeapons: rangedWeapons };
    }

    static async #skillRoll(event, target) {
        DieselDrachenNpcActorSheetV2.handleSkillRoll(event, target, this.actor);
    }
}

