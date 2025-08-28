// Import document classes.
import { DieseldrachenActor } from './documents/actor.mjs';
import { DieseldrachenItem } from './documents/item.mjs';
// Import sheet classes.
import { DieseldrachenActorSheet } from './sheets/actor-sheet.mjs';
import { DieseldrachenItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { DIESELDRACHEN } from './helpers/config.mjs';
import {DieseldrachenCombat} from './combat.mjs'
import {showLuckReRollDialog} from './luck.mjs';

// Import DataModel classes
import * as models from './data/_module.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.dieseldrachenvtt = {
    DieseldrachenActor,
    DieseldrachenItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.DIESELDRACHEN = DIESELDRACHEN;

  CONFIG.Combat.documentClass = DieseldrachenCombat;

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = DieseldrachenActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.DieseldrachenCharacter,
    npc: models.DieseldrachenNPC,
    vehicle: models.DieseldrachenVehicle
  }

  CONFIG.Item.documentClass = DieseldrachenItem;
  CONFIG.Item.dataModels = {
    item: models.DieseldrachenItem,
    clothing: models.DieseldrachenClothing,
    meleeWeapon: models.DieseldrachenMeleeWeapon,
    rangedWeapon: models.DieseldrachenRangedWeapon,
    trick: models.DieseldrachenTrick,
    knowledge: models.DieseldrachenKnowledge,
    artefact: models.DieseldrachenArtefact,
    technicManeuver: models.DieseldrachenTechnicManeuver,
    vehicleUpgrade: models.DieseldrachenVehicleUpgrade,
    vehicleWeapon: models.DieseldrachenVehicleWeapon,
    npcSpecialDice: models.DieseldrachenNPCSpecialDice,
    spleen: models.DieseldrachenSpleen,
    spell: models.DieseldrachenSpell,
    handgrenade: models.DieseldrachenHandGrenade
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet('dieseldrachen-vtt', DieseldrachenActorSheet, {
    makeDefault: true,
    label: 'DIESELDRACHEN.SheetLabels.Actor',
  });
  foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet('dieseldrachen-vtt', DieseldrachenItemSheet, {
    makeDefault: true,
    label: 'DIESELDRACHEN.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('diceIcon', function (die) {
  if (parseInt(die) < 4) {
    return "<span>-</span>";
  }

  let t = `<span class="diesel-dice-icon single-small-visible d${die}" title="D${die}"></span>`;
  return t;
});


Handlebars.registerHelper('isHealthMarker', function (str, value) {
  console.log("str:" + str)
  console.log("value:" + value)
  if (parseInt(str) + 1 == value) {
    return true;
  }
  return false;
});

Handlebars.registerHelper('times', function (n, block) {
  var accum = '';
  for (var i = 0; i < n; ++i)
    accum += block.fn(i);
  return accum;
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));

  Hooks.on('renderChatMessage', (message, html, context) => {
    // Find the luck roll button and add a click listener
    let button = html[0].querySelector('.luck-roll-button');
    if (button) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const originalFaces = button.dataset.originalFaces;
        const originalValues = button.dataset.originalValues;
        const difficulty = button.dataset.difficulty;
        showLuckReRollDialog(originalFaces, originalValues,difficulty);
      });
    }
  });

});

Hooks.once("item-piles-ready", async () => {
  setupItemPiles();
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.dieseldrachenvtt.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'dieseldrachen-vtt.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}

async function setupItemPiles() {
  console.log("setting up item piles")

  const data = {

    "VERSION": "1.0",

    // The actor class type is the type of actor that will be used for the default item pile actor that is created on first item drop.
    "ACTOR_CLASS_TYPE": "character",

    // The item class type is the type of item that will be used for the default loot item
    "ITEM_CLASS_LOOT_TYPE": "",

    // The item class type is the type of item that will be used for the default weapon item
    "ITEM_CLASS_WEAPON_TYPE": "",

    // The item class type is the type of item that will be used for the default equipment item
    "ITEM_CLASS_EQUIPMENT_TYPE": "",

    // The item quantity attribute is the path to the attribute on items that denote how many of that item that exists
    "ITEM_QUANTITY_ATTRIBUTE": "system.quantity",
    "ITEM_PRICE_ATTRIBUTE": "system.purchasePrice",

    // Item filters actively remove items from the item pile inventory UI that users cannot loot, such as spells, feats, and classes
    "ITEM_FILTERS": [
      {
        "path": "type",
        "filters": "trick,knowledge,technicManeuver,vehicleUpgrade,vehicleWeapon,npcSpecialDice,spleen,spell"
      }
    ],

    // Item similarities determines how item piles detect similarities and differences in the system
    "ITEM_SIMILARITIES": [], // ["name", "type", "system.light.remainingSecs"],

    //prevent items from stacking
    "UNSTACKABLE_ITEM_TYPES": [],

    // Currencies in item piles is a versatile system that can accept actor attributes (a number field on the actor's sheet) or items (actual items in their inventory)
    // In the case of attributes, the path is relative to the "actor.system"
    // In the case of items, it is recommended you export the item with `.toObject()` and strip out any module data
    "CURRENCIES": [
      {
        "type": "attribute",
        "name": "Bargeld",
        "img": "icons/commodities/currency/coin-embossed-crown-gold.webp",
        "abbreviation": "{#}$",
        "data": {
          "path": "system.money"
        },
        "primary": true,
        "exchangeRate": 1
      },

    ],

    // This function is an optional system handler that specifically transforms an item's price into a more unified numeric format
    /*"ITEM_COST_TRANSFORMER": (item, currencies) => {
        const cost = foundry.utils.getProperty(item, "system.cost") ?? {};
        let totalCost = 0;
        for (const costDenomination in cost) {
            const subCost = Number(foundry.utils.getProperty(cost, costDenomination)) ?? 0;
            if (subCost === 0) {
                continue;
            }
            const currencyDenomination = currencies.filter((currency) => currency.type === "attribute").find((currency) => {
                return currency.data.path.toLowerCase().endsWith(costDenomination);
            });
            totalCost += subCost * currencyDenomination?.exchangeRate;
        }
        return totalCost;
    }*/
  }

  await game.itempiles.API.addSystemIntegration(data);
  console.log("finished setting up item piles")
}