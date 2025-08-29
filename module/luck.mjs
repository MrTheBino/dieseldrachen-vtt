import { addShowDicePromise,isCriticalMissOnArray,isCriticalHit } from "./roll_dialog.mjs"

export async function showLuckReRollDialog(diceFaceJson, valueJson, difficulty) {

    const actor = game.user.character;

    if(actor.system.luck <= 0) {
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            content: `Der Charakter hat keine Glückspunkte mehr.`
        });
        return;
    }

    diceFaceJson = JSON.parse(diceFaceJson)
    valueJson = JSON.parse(valueJson)

    let selectDiceOne = diceFaceJson[0]
    let selectDiceTwo = diceFaceJson[1]
    let selectDiceThree = diceFaceJson[2]

    let orgDiceValueOne = valueJson[0]
    let orgDiceValueTwo = valueJson[1]
    let orgDiceValueThree = valueJson[2]

    const html = await foundry.applications.handlebars.renderTemplate(
        "systems/dieseldrachen-vtt/templates/dialogs/luck-reroll-dialog.hbs",
        {
            selectDiceOne: selectDiceOne,
            selectDiceTwo: selectDiceTwo,
            selectDiceThree: selectDiceThree,
            orgDiceValueOne: orgDiceValueOne,
            orgDiceValueTwo: orgDiceValueTwo,
            orgDiceValueThree: orgDiceValueThree,
            difficulty: difficulty
        }
    );

    return new Promise((resolve) => {
        new foundry.applications.api.DialogV2({
            window: { title: "Glück ausgeben" },
            content: html,
            buttons: [
                {
                    action: 'roll',
                    icon: '<i class="fas fa-dice-d6"></i>',
                    label: game.i18n.localize("DIESELDRACHEN.Labels.Roll"),
                    callback: (event, button, dialog) => luckReRollCallback(event, button, dialog),
                },
            ],
            default: "roll",
            close: () => resolve(null),
        }).render(true);
    });
}

async function luckReRollCallback(event, button, dialog) {
    const actor = game.user.character;
    const form = button.form;
    const difficulty = form.difficulty.value;

    let selectDiceOne = form.rerollDiceOne.checked;
    let selectDiceTwo = form.rerollDiceTwo.checked;
    let selectDiceThree = form.rerollDiceThree.checked;

    let orgDiceValueOne = parseInt(form.orgDiceValueOne.value);
    let orgDiceValueTwo = parseInt(form.orgDiceValueTwo.value);
    let orgDiceValueThree = parseInt(form.orgDiceValueThree.value);

    let orgDiceFaceOne = parseInt(form.orgDiceFaceOne.value);
    let orgDiceFaceTwo = parseInt(form.orgDiceFaceTwo.value);
    let orgDiceFaceThree = parseInt(form.orgDiceFaceThree.value);

    const dicePromises = [];
    let finalResults = [];
    let numRerolls = 0;
    let total = 0;

    finalResults[0] = { reroll: selectDiceOne, value: orgDiceValueOne, finalValue: orgDiceValueOne, die: orgDiceFaceOne }
    finalResults[1] = { reroll: selectDiceTwo, value: orgDiceValueTwo, finalValue: orgDiceValueTwo, die: orgDiceFaceTwo }
    finalResults[2] = { reroll: selectDiceThree, value: orgDiceValueThree, finalValue: orgDiceValueThree, die: orgDiceFaceThree }

    finalResults.forEach(result => {
        if (result.reroll) {
            numRerolls += 1;
        }
    });

    if (numRerolls === 2 || numRerolls === 0) {
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            content: `Glückswurf: Es können nur einer oder alle Würfel neu geworfen werden.`
        });
        return;
    }

    if (selectDiceOne) {
        finalResults[0].reroll = true;
        const dicePoolRoll1 = new Roll(`1d${finalResults[0].die}`, actor.getRollData());
        await dicePoolRoll1.evaluate();
        addShowDicePromise(dicePromises, dicePoolRoll1);
        finalResults[0].finalValue = dicePoolRoll1.total;
    }
    if (selectDiceTwo) {
        finalResults[1].reroll = true;
        const dicePoolRoll2 = new Roll(`1d${finalResults[1].die}`, actor.getRollData());
        await dicePoolRoll2.evaluate();
        addShowDicePromise(dicePromises, dicePoolRoll2);
        finalResults[1].finalValue = dicePoolRoll2.total;
    }
    if (selectDiceThree) {
        finalResults[2].reroll = true;
        const dicePoolRoll3 = new Roll(`1d${finalResults[2].die}`, actor.getRollData());
        await dicePoolRoll3.evaluate();
        addShowDicePromise(dicePromises, dicePoolRoll3);
        finalResults[2].finalValue = dicePoolRoll3.total;
    }

    await Promise.all(dicePromises);

    total = finalResults[0].finalValue + finalResults[1].finalValue + finalResults[2].finalValue;

    // luck aktualisieren
    let actorLeftLuck = actor.system.luck;
    actorLeftLuck -= 1;
    await actor.update({ "system.luck": actorLeftLuck });

    const html = await foundry.applications.handlebars.renderTemplate(
        "systems/dieseldrachen-vtt/templates/chat/luck-reroll-result.hbs",
        { finalResults: finalResults, numRerolls: numRerolls, total: total ,isCriticalHit: isCriticalHit(total, difficulty),isCriticalMiss: isCriticalMissOnArray(finalResults.map(r => r.finalValue)),isSuccess: total >= difficulty }
    );
    ChatMessage.create({
        content: html,
        speaker: ChatMessage.getSpeaker({ actor }),
    });
}