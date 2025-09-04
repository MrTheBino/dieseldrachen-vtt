/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return foundry.applications.handlebars.loadTemplates([
    // Chat partials
    'systems/dieseldrachen-vtt/templates/chat/success-partial.hbs',
    'systems/dieseldrachen-vtt/templates/chat/luck-roll-button-partial.hbs',
    'systems/dieseldrachen-vtt/templates/chat/hit-quality-result.hbs',

    // Shared partials
    'systems/dieseldrachen-vtt/templates/shared/dice-option-select-partial.hbs',
    'systems/dieseldrachen-vtt/templates/shared/actor-dice-select.hbs',
    'systems/dieseldrachen-vtt/templates/shared/healthbar-partial.hbs',

    // V2
    'systems/dieseldrachen-vtt/templates/v2/actor/actor-partial-npc-common.html',
    'systems/dieseldrachen-vtt/templates/v2/actor/actor-partial-tabs.html',
    'systems/dieseldrachen-vtt/templates/v2/actor/actor-partial-npc.html',
    'systems/dieseldrachen-vtt/templates/v2/partial-biography.html',
    'systems/dieseldrachen-vtt/templates/v2/actor/character/partials/actor-tricks.hbs',
    'systems/dieseldrachen-vtt/templates/v2/actor/character/partials/actor-fight.hbs',
    'systems/dieseldrachen-vtt/templates/v2/actor/character/partials/actor-technic-maneuvers.hbs',
    'systems/dieseldrachen-vtt/templates/v2/actor/character/partials/actor-knowledge.hbs',
    'systems/dieseldrachen-vtt/templates/v2/actor/character/partials/social-partial.hbs',
    'systems/dieseldrachen-vtt/templates/v2/actor/vehicle/speed-partial.hbs',
    'systems/dieseldrachen-vtt/templates/v2/actor/vehicle/motor-damage-partial.hbs',
    'systems/dieseldrachen-vtt/templates/v2/actor/vehicle/tire-wing-partial.hbs',
    'systems/dieseldrachen-vtt/templates/v2/item/item-meleeWeapon-sheet.hbs',
    'systems/dieseldrachen-vtt/templates/v2/item/item-item-sheet.hbs'
  ]);
};
