/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return foundry.applications.handlebars.loadTemplates([
    // Actor partials.
    'systems/dieseldrachen-vtt/templates/actor/parts/actor-features.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/actor-dice-select.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/actor-items.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/actor-spells.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/actor-magic.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/actor-effects.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/actor-social.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/actor-tricks.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/social-partial.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/actor-knowledge.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/actor-technic-maneuvers.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/actor-fight.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/healthbar-partial.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/motor-damage-partial.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/tire-wing-partial.hbs',
    'systems/dieseldrachen-vtt/templates/actor/parts/speed-partial.hbs',
    // Item partials
    'systems/dieseldrachen-vtt/templates/item/parts/item-effects.hbs',
  ]);
};
