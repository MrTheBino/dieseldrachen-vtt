import { DieseldrachenActorSheetV2 } from "./actor-sheet-v2.mjs"
import { rollDialogSavingThrow1, rollV1Resting } from "../roll_dialog.mjs"
import { doCharacterHealing } from "../helpers/character.mjs";

export class DieselDrachenCharacterActorSheetV2 extends DieseldrachenActorSheetV2 {
    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
        position: {
            height: 900,
            width: 800
        },
        classes: [""],
        actions: {
            savingThrowRoll: this.#handleSavingThrowRoll,
            clickActionRest: this.#handleActionRest,
            clickActionHeal: this.#handleActionHeal
        }
    }

    /** @inheritDoc */
    static PARTS = {
        form: {
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/actor-partial-character.html'
        },
        tabs: {
            // Foundry-provided generic template
            template: 'templates/generic/tab-navigation.hbs',
            // classes: ['sysclass'], // Optionally add extra classes to the part for extra customization
        },
        general: {
            id: 'general',
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/character/tab-general.html',
            scrollable: [''],
        },
        social: {
            id: 'social',
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/character/tab-social.html',
            scrollable: [''],
        },
        items: {
            id: 'items',
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/character/tab-items.html',
            scrollable: [''],
        },
        magic: {
            id: 'magic',
            template: 'systems/dieseldrachen-vtt/templates/v2/actor/character/tab-magic.html',
            scrollable: [''],
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
                    { id: 'general', group: 'sheet', label: 'Allgemein' },
                    { id: 'social', group: 'sheet', label: 'Sozial' },
                    { id: 'items', group: 'sheet', label: 'Gegenstände' },
                    { id: 'magic', group: 'sheet', label: 'Magie' },
                    { id: 'biography', group: 'sheet', label: 'Biografie' },
                ],
            initial: 'general'
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



        foundry.utils.mergeObject(context, items);
        return context;
    }

    _prepareItems() {
        const npcSpecialDice = [];
        const rangedWeapons = [];
        const meleeWeapons = [];
        const tricks = [];
        const features = [];
        const clothing = [];
        const knowledge = [];
        const technicManeuvers = [];
        const handgrenades = [];
        const artefacts = [];
        const spells = [];
        const gear = [];

        let characterSpleen = null;
        let mobilityValue = 12;
        let currentArmor = 0;

        let inventory = this.options.document.items;
        for (let i of inventory) {
            i.img = i.img || Item.DEFAULT_ICON;
            // Append to gear.
            if (i.type === 'item') {
                gear.push(i);
                mobilityValue = mobilityValue - (i.system.weight * i.system.quantity);
            }
            // Append to features.
            else if (i.type === 'feature') {
                features.push(i);
            }
            else if (i.type === 'clothing') {
                clothing.push(i);
                if (i.system.mounted) {
                    mobilityValue = mobilityValue - i.system.armor;
                    currentArmor += i.system.armor;
                } else {
                    if (i.system.weight != undefined) {
                        mobilityValue = mobilityValue - i.system.weight;
                    }
                }
            }
            else if (i.type === 'meleeWeapon') {
                meleeWeapons.push(i);
                if (i.system.weight != undefined) {
                    mobilityValue = mobilityValue - i.system.weight;
                }
            }
            else if (i.type === 'rangedWeapon') {
                rangedWeapons.push(i);
                if (i.system.mounted && i.system.weight != undefined) {
                    mobilityValue = mobilityValue - i.system.weight;
                }
            }
            else if (i.type === 'trick') {
                tricks.push(i);
            }
            else if (i.type === 'knowledge') {
                knowledge.push(i);
            }
            else if (i.type === 'technicManeuver') {
                technicManeuvers.push(i);
            }
            else if (i.type == "spleen") {
                characterSpleen = i;
            }
            else if (i.type == "handgrenade") {
                handgrenades.push(i);
            }
            else if (i.type === 'artefact') {
                artefacts.push(i);
                if (i.system.weight != undefined) {
                    mobilityValue = mobilityValue - i.system.weight;
                }
            }
            // Append to spells.
            else if (i.type === 'spell') {
                spells.push(i);
            }
        }

        // plain and dirty dice calculation
        // TODO: better solution
        const mobilityTable = {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 4,
            5: 4,
            6: 6,
            7: 6,
            8: 8,
            9: 8,
            10: 10,
            11: 10,
            12: 12
        }

        if (mobilityValue < 0) {
            mobilityValue = 0;
        }

        context.mobilityValue = mobilityValue;
        context.mobilityDice = mobilityTable[mobilityValue];

        return {
            gear: gear,
            features: features,
            spells: spells,
            clothing: clothing,
            mobilityValue: mobilityValue,
            mobilityDice: mobilityTable[mobilityValue],
            meleeWeapons: meleeWeapons,
            rangedWeapons: rangedWeapons,
            tricks: tricks,
            knowledge: knowledge,
            artefacts: artefacts,
            technicManeuvers: technicManeuvers,
            currentArmor: currentArmor,
            characterSpleen: characterSpleen,
            handgrenades: handgrenades
        }
    }

    static async #handleSavingThrowRoll(event, target) {
        rollDialogSavingThrow1(this.actor, target.dataset.roll, target.dataset.label);
    }

    static async #handleActionHeal(event, target) {
        event.preventDefault();
        if (this._checkCharacterCanHealOrRest(this.actor) == false) {
            return;
        }

        const dialogHtml = await foundry.applications.handlebars.renderTemplate(
            "systems/dieseldrachen-vtt/templates/dialogs/heal-dialog.hbs",
            { hasCondition: this.actor.system.condition.length > 0, condition: this.actor.system.condition }
        );

        const proceed = await foundry.applications.api.DialogV2.confirm({
            content: dialogHtml,
            rejectClose: false,
            modal: true
        });
        if (proceed) {

            let totalHealed = await doCharacterHealing(this.actor);

            const chatVars = {
                label: 'Lange Ruhepause',
                actorCondition: this.actor.system.condition,
                totalHealed: totalHealed
            };

            const html = await foundry.applications.handlebars.renderTemplate(
                "systems/dieseldrachen-vtt/templates/chat/character-healing-result.hbs",
                chatVars
            );
            ChatMessage.create({
                content: html,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            });
        }
    }

    static async #handleActionRest(event, target) {
        event.preventDefault();

        if (this._checkCharacterCanHealOrRest(this.actor) == false) {
            return;
        }

        const html = await foundry.applications.handlebars.renderTemplate(
            "systems/dieseldrachen-vtt/templates/dialogs/rest-dialog.hbs",
            { hasCondition: this.actor.system.condition.length > 0, condition: this.actor.system.condition }
        );

        const proceed = await foundry.applications.api.DialogV2.confirm({
            content: html,
            rejectClose: false,
            modal: true
        });
        if (proceed) {
            rollV1Resting(this.actor);
        }
    }

    _checkCharacterCanHealOrRest(actor) {
        if (actor.system.heavyInjuries > 0) {
            ChatMessage.create({
                content: `Der Charakter hat ${actor.system.heavyInjuries} schwere Verletzungen und kann sich nicht ausruhen oder heilen.`,
                speaker: ChatMessage.getSpeaker({ actor: actor }),
            });
            return false;
        }
        return true;
    }
}

