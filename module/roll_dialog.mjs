export function addShowDicePromise(promises, roll) {
  if (game.dice3d) {
    // we pass synchronize=true so DSN dice appear on all players' screens
    promises.push(game.dice3d.showForRoll(roll, game.user, true, null, false));
  }
}

function isCriticalMiss(diceRoll) {

  let diceValues = [];
  let criticMissSum1 = 0;
  let criticMissSum2 = 0;

  // collect the dice results
  diceRoll.terms.forEach((term) => {
    if (term.constructor.name === "Die") {
      term.results.forEach((result) => {
        diceValues.push(result.result);
      });
    }
  });

  // count ones and twos
  diceValues.forEach((value) => {
    if (value == 1) {
      criticMissSum1 += 1;
    }
    else if (value == 2) {
      criticMissSum2 += 1;
    }
  });

  if (criticMissSum1 == 3) {
    return true;
  }

  if (criticMissSum1 == 2 && criticMissSum2 == 1) {
    return true;
  }
  return false;
}

function isCriticalHit(diceRoll, difficulty) {
  if (diceRoll.total >= (difficulty * 2)) {
    return true;
  }
  return false;
}

export async function rollDialogMeleeWeaponV1(actor, itemId, label) {
  const item = actor.items.get(itemId);
  const actorRollData = actor.getRollData();
  let diceFormula = "";
  let weaponTypeLabel = ""
  let recoil = 0;
  let modDice = 0;

  if (actor.type == "npc") {
    // NPCs
    weaponTypeLabel = item.name;
    label = item.name;
    diceFormula = `2d${actor.system.dice}`
  }
  else {
    // Charaktere
    console.log("ability: ", item.system.ability);
    if (item.system.ability === "brawl") {
      diceFormula = `1d${actor.system.attributes.reaction} + 1d${actor.system.abilities.brawl}`;
      weaponTypeLabel = "Prügeln";
      label = "Reaktion + Prügeln";
    } else if (item.system.ability === "fencing") {
      diceFormula = `1d${actor.system.attributes.skill} + 1d${actor.system.abilities.fencing}`;
      weaponTypeLabel = "Fechten";
      label = "Geschick + Fechten";
    } else {
      label = "Fehler: ability nicht zugewiesen";
    }
  }

  const cardTitle = "Nahkampf - " + item.name;
  const rollResult = {
    actor,
    weaponTypeLabel,
    cardTitle,
    diceFormula,
    label,
    itemId,
    modDice
  };

  const html = await foundry.applications.handlebars.renderTemplate(
    "systems/dieseldrachen-vtt/templates/dialogs/melee_weapon_roll_dialog.hbs",
    rollResult
  );

  return new Promise((resolve) => {
    new foundry.applications.api.DialogV2({
      window: { title: cardTitle },
      content: html,
      buttons: [
        {
          action: 'roll',
          icon: '<i class="fas fa-dice-d6"></i>',
          label: game.i18n.localize("DIESELDRACHEN.Labels.Roll"),
          callback: (event, button, dialog) => rollDialogV1MeleeWeaponCallback(event, button, dialog, actor),
        },
      ],
      default: "roll",
      close: () => resolve(null),
    }).render(true);
  });
}

export async function rollDialogRangedWeaponV1(actor, itemId, label) {
  const item = actor.items.get(itemId);
  const actorRollData = actor.getRollData();
  let diceFormula = "";
  let weaponTypeLabel = ""
  let recoil = 0;
  let modDice = 0;

  if (actor.type == "npc") {
    diceFormula = `2d${actor.system.dice}`;
    weaponTypeLabel = item.name;
    label = item.name;
  } else {
    if (item.system.weaponType === "pistol") {
      diceFormula = `1d${actor.system.attributes.skill} + 1d${actor.system.abilities.pistols}`;
      weaponTypeLabel = "Pistole";
      label = "Geschick + Pistole";
    } if (item.system.weaponType === "rifle") {
      diceFormula = `1d${actor.system.attributes.skill} + 1d${actor.system.abilities.rifles}`;
      weaponTypeLabel = "Gewehr";
      label = "Geschick + Gewehr";
    }
  }

  const cardTitle = "Fernkampfangriff - " + item.name;
  const rollResult = {
    actor,
    weaponTypeLabel,
    cardTitle,
    diceFormula,
    label,
    recoil,
    itemId,
    modDice
  };

  const html = await foundry.applications.handlebars.renderTemplate(
    "systems/dieseldrachen-vtt/templates/dialogs/ranged_weapon_roll_dialog.hbs",
    rollResult
  );

  return new Promise((resolve) => {
    new foundry.applications.api.DialogV2({
      window: { title: cardTitle, width:400 },
      content: html,
      classes: ["ranged-weapon-roll-dialog"],
      buttons: [
        {
          action: 'roll',
          icon: '<i class="fas fa-dice-d6"></i>',
          label: game.i18n.localize("DIESELDRACHEN.Labels.Roll"),
          callback: (event, button, dialog) => rollDialogV1RangedWeaponCallback(event, button, dialog, actor),
        },
      ],
      default: "roll",
      close: () => resolve(null),
    }).render({ force: true });
  });
}

export async function rollDialogSkillV1(actor, formula, label) {
  let rollDiceFaceSuccess = 5;
  const actorRollData = actor.getRollData();
  let diceFormula = formula;
  let modDice = 0

  const cardTitle = "RollDialog";
  const rollResult = {
    actor,
    cardTitle,
    diceFormula,
    label,
    modDice,
    rollDiceFaceSuccess
  };
  const html = await foundry.applications.handlebars.renderTemplate(
    "systems/dieseldrachen-vtt/templates/dialogs/skill_roll_dialog.hbs",
    rollResult
  );

  return new Promise((resolve) => {
    new foundry.applications.api.DialogV2({
      window: { title: "Würfeldialog" },
      content: html,
      buttons: [
        {
          action: 'roll',
          icon: '<i class="fas fa-dice-d6"></i>',
          label: game.i18n.localize("DIESELDRACHEN.Labels.Roll"),
          callback: (event, button, dialog) => rollDialogV1Callback(event, button, dialog, actor),
        },
      ],
      default: "roll",
      close: () => resolve(null),
    }).render({ force: true });
  });
}

async function rollDialogV1Callback(event, button, dialog, actor) {

  const form = button.form;
  const actorRollData = actor.getRollData();

  const label = form.label.value;
  let rollFormula = form.diceFormula.value
  const modDice = form.modDice.value;
  let isSuccess = false;
  const difficulty = parseInt(form.difficulty.value) || 10;

  const dicePromises = [];

  if (modDice && modDice !== "") {
    rollFormula = rollFormula + `+ d${modDice}`;
  }
  const dicePoolRoll = new Roll(rollFormula, actorRollData);
  await dicePoolRoll.evaluate();


  addShowDicePromise(dicePromises, dicePoolRoll);
  await Promise.all(dicePromises);

  let dicePoolRollHTML = await dicePoolRoll.render();

  let criticalMiss = isCriticalMiss(dicePoolRoll);
  let criticalHit = isCriticalHit(dicePoolRoll, difficulty);

  if (difficulty && dicePoolRoll.total >= difficulty) {
    isSuccess = true;
  }

  const rollDialogVars = {
    dicePoolRoll: dicePoolRoll,
    dicePoolRollHTML: dicePoolRollHTML,
    total: dicePoolRoll.total,
    label: label,
    isSuccess: isSuccess,
    difficulty: difficulty,
    isCriticalMiss: criticalMiss,
    isCriticalHit: criticalHit
  }
  renderSkillRollResult(actor, rollDialogVars);
}

async function rollDialogV1RangedWeaponCallback(event, button, dialog, actor) {
  const form = button.form;
  const actorRollData = actor.getRollData();

  const item = actor.items.get(form.itemId.value);
  const label = form.label.value;
  let rollFormula = form.diceFormula.value
  let isSuccess = false;
  const difficulty = parseInt(form.difficulty.value) || 10;
  const range = form.range.value;
  let damageValue = 0;
  const recoil = parseInt(form.recoil.value) || 0;
  //const modDice = form.modDice.value || "";


  const dicePromises = [];

  // Präzision ist der Moduswürfel
  switch (range) {
    case "near":
      rollFormula = rollFormula + `+ 1d${item.system.precision_near}`;
      damageValue = item.system.damage_near;
      break;
    case "close":
      rollFormula = rollFormula + `+ 1d${item.system.precision_close}`;
      damageValue = item.system.damage_close;
      break;
    case "far":
      rollFormula = rollFormula + `+ 1d${item.system.precision_far}`;
      damageValue = item.system.damage_far;
      break;
  }

  // Rückstoss
  if (recoil > 0) {
    rollFormula = rollFormula + `- ${recoil}`;
  }

  const dicePoolRoll = new Roll(rollFormula, actorRollData);
  await dicePoolRoll.evaluate();


  let criticalMiss = isCriticalMiss(dicePoolRoll);
  let criticalHit = isCriticalHit(dicePoolRoll, difficulty);

  addShowDicePromise(dicePromises, dicePoolRoll);
  await Promise.all(dicePromises);

  let dicePoolRollHTML = await dicePoolRoll.render();

  if (difficulty && dicePoolRoll.total >= difficulty) {
    isSuccess = true;
  }

  const rollDialogVars = {
    dicePoolRoll: dicePoolRoll,
    dicePoolRollHTML: dicePoolRollHTML,
    total: dicePoolRoll.total,
    label: label,
    damage: damageValue,
    range: game.i18n.localize(`DIESELDRACHEN.Ranges.${range}`),
    difficulty: difficulty,
    isSuccess: isSuccess,
    rollFormula: rollFormula,
    isCriticalMiss: criticalMiss,
    isCriticalHit: criticalHit,
    recoil: recoil,
    rate: item.system.rate
  }
  renderRangedWeaponRollResult(actor, rollDialogVars);
}

async function rollDialogV1MeleeWeaponCallback(event, button, dialog, actor) {
  const form = button.form;
  const actorRollData = actor.getRollData();

  const item = actor.items.get(form.itemId.value);
  const label = form.label.value;
  let rollFormula = form.diceFormula.value
  let isSuccess = false;
  const difficulty = parseInt(form.difficulty.value) || 10;
  let damageValue = 0;
  const modDice = form.modDice.value || "";


  const dicePromises = [];

  if (modDice && modDice !== "") {
    rollFormula = rollFormula + `+ d${modDice}`;
  }

  const dicePoolRoll = new Roll(rollFormula, actorRollData);
  await dicePoolRoll.evaluate();
  let criticalMiss = isCriticalMiss(dicePoolRoll);
  let criticalHit = isCriticalHit(dicePoolRoll, difficulty);

  addShowDicePromise(dicePromises, dicePoolRoll);
  await Promise.all(dicePromises);

  if (difficulty && dicePoolRoll.total >= difficulty) {
    isSuccess = true;
  }

  let dicePoolRollHTML = await dicePoolRoll.render();

  // damage calulcation
  let dmgStr = item.system.damage || "";
  let dmgTokens = dmgStr.split("+");

  let rollFormulaDamage = "";
  dmgTokens.forEach((token) => {
    token = token.toUpperCase();
    token = token.trim();
    if (token.includes("K")) {
      let t = token.replace("K", "");
      let num = 1;
      if (t.length > 0) {
        num = parseInt(t);
      }
      if (actor.type == "npc") {
        rollFormulaDamage += `+${num}`;
      } else {
        rollFormulaDamage += `+(${num}*${actor.system.abilities.strength})`;
      }
    }
    else if (token.includes("E") == false && token.length > 0) {
      rollFormulaDamage += `+${token}`;
    }
  })

  console.log("rollFormulaDamage: ", rollFormulaDamage);
  let damageResult = 0;
  if (rollFormulaDamage.length > 0) {

    const dicePoolRollDamage = new Roll(rollFormulaDamage, actor.getRollData());
    await dicePoolRollDamage.evaluate();

    if (game.dice3d) {
      // we pass synchronize=true so DSN dice appear on all players' screens
      game.dice3d.showForRoll(dicePoolRollDamage, game.user, true, null, false);
    }

    damageResult = dicePoolRollDamage.total;
    rollFormulaDamage = dicePoolRollDamage.formula;
  } else {
    damageResult = item.system.damage
  }

  const rollDialogVars = {
    dicePoolRoll: dicePoolRoll,
    dicePoolRollHTML: dicePoolRollHTML,
    total: dicePoolRoll.total,
    label: label,
    damage: damageResult,
    damageFormula: item.system.damage,
    damageRollFormula: rollFormulaDamage,
    range: game.i18n.localize(`DIESELDRACHEN.Ranges.${item.system.range}`),
    difficulty: difficulty,
    isSuccess: isSuccess,
    isCriticalMiss: criticalMiss,
    isCriticalHit: criticalHit
  }
  renderMeleeWeaponRollResult(actor, rollDialogVars);
}

export async function renderSkillRollResult(actor, rollResult) {
  const html = await foundry.applications.handlebars.renderTemplate(
    "systems/dieseldrachen-vtt/templates/chat/skill-roll-result.hbs",
    rollResult
  );
  ChatMessage.create({
    content: html,
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}

export async function renderRangedWeaponRollResult(actor, rollResult) {
  const html = await foundry.applications.handlebars.renderTemplate(
    "systems/dieseldrachen-vtt/templates/chat/ranged-weapon-roll-result.hbs",
    rollResult
  );
  ChatMessage.create({
    content: html,
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}

export async function renderMeleeWeaponRollResult(actor, rollResult) {
  const html = await foundry.applications.handlebars.renderTemplate(
    "systems/dieseldrachen-vtt/templates/chat/melee-weapon-roll-result.hbs",
    rollResult
  );
  ChatMessage.create({
    content: html,
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}
