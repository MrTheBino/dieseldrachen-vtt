import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';
import { DieseldrachenItem } from '../documents/item.mjs';
import { rollDialogSkillV1, rollDialogRangedWeaponV1, rollDialogMeleeWeaponV1,rollDialogSavingThrow1 } from '../roll_dialog.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class DieseldrachenActorSheet extends foundry.appv1.sheets.ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dieseldrachen-vtt', 'sheet', 'actor'],
      width: 800,
      height: 800,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/dieseldrachen-vtt/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.DIESELDRACHEN
    context.config = CONFIG.DIESELDRACHEN;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    if (actorData.type == 'vehicle') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const clothing = [];
    const features = [];
    const meleeWeapons = [];
    const rangedWeapons = [];
    const tricks = [];
    const knowledge = [];
    const artefacts = [];
    const technicManeuvers = [];
    const vehicleUpgrades = [];
    const vehicleWeapons = [];
    const npcSpecialDice = [];
    let characterSpleen = null;
    let currentArmor = 0;
    const spells = [];

    let mobilityValue = 12;
    // Iterate through items, allocating to containers
    for (let i of context.items) {
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
      else if (i.type === 'vehicleUpgrade') {
        vehicleUpgrades.push(i);
      }
      else if (i.type === 'vehicleWeapon') {
        vehicleWeapons.push(i);
      }
      else if(i.type === 'npcSpecialDice') {
        npcSpecialDice.push(i);
      }
      else if(i.type == "spleen") {
        characterSpleen = i;
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
      11: 11,
      12: 12
    }

    if (mobilityValue < 0) {
      mobilityValue = 0;
    }
    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.clothing = clothing;
    context.mobilityValue = mobilityValue;
    context.mobilityDice = mobilityTable[mobilityValue];
    context.meleeWeapons = meleeWeapons;
    context.rangedWeapons = rangedWeapons;
    context.tricks = tricks;
    context.knowledge = knowledge;
    context.artefacts = artefacts;
    context.technicManeuvers = technicManeuvers;
    context.vehicleUpgrades = vehicleUpgrades;
    context.vehicleWeapons = vehicleWeapons;
    context.currentArmor = currentArmor;
    context.npcSpecialDice = npcSpecialDice;
    context.characterSpleen = characterSpleen;

    let numSegments = 33;
    if (this.object.type == "npc") {
      numSegments = this.object.system.health.max + 1;
    }

    context.healthbar_segments = new Array(numSegments);

    let json_data = JSON.parse(this.object.system.healthbar || "[]");
    for (let i = 0; i < numSegments; i++) {
      context.healthbar_segments[i] = { sign: json_data[i], value: i, index: i, css_class: "" };

      if (this.object.system.health.max >= i) {
        context.healthbar_segments[i].css_class = 'green';
      } else {
        context.healthbar_segments[i].css_class = 'unused';
      }
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    html.on('click', '.spleen-edit', (ev) => {
      const item = this.actor.items.get(ev.currentTarget.dataset.itemId);
      item.sheet.render(true);
    });
    

    html.on('click','.expandable-trigger', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      let t = li.find('.expandable')[0];
      t.classList.toggle('closed');
      
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Dice Select for attributes and abilities
    html.on('click', '.char-dice-select', (ev) => {
      const input = ev.currentTarget;
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
    });

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    html.on('click', '.vehicle_motor_damage', (ev) => {
      const value = parseInt(ev.currentTarget.dataset.value);
      const unused = parseInt(ev.currentTarget.dataset.unused);
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


    });

    html.on('click', '.vehicle_speed', (ev) => {
      const value = parseInt(ev.currentTarget.dataset.value);
      const unused = parseInt(ev.currentTarget.dataset.unused);
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
    });

    html.on('click', '.tire_wing_damage', (ev) => {
      const value = parseInt(ev.currentTarget.dataset.value);
      const unused = parseInt(ev.currentTarget.dataset.unused);
      const name = 'system.tireWing';

      let t = parseInt(foundry.utils.getProperty(this.actor, name));
      if (t === 1 && value === 1) {
        this.actor.update({ [name]: 0 });
      } else {
        this.actor.update({ [name]: value });
      }
    });


    html.on('change', '.item-editable-stat', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));

      if (ev.target.type === 'checkbox') {
        item.update({ [ev.target.dataset.itemStat]: ev.target.checked });
      } else {
        item.update({ [ev.target.dataset.itemStat]: ev.target.value });
      }
    });

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));

    html.on('click', '.healthbar-segment', (ev) => {
      const segment = ev.currentTarget;
      let json_data = JSON.parse(this.actor.system.healthbar || "[]");
      if (json_data[segment.dataset.healthvalue] == 'X') {
        json_data[segment.dataset.healthvalue] = '';
      } else {
        json_data[segment.dataset.healthvalue] = 'X';
      }

      this.actor.update({ ['system.healthbar']: JSON.stringify(json_data) });
    });


    html.on('click', '.healthbar-reset', (ev) => {
      this._resetHealthBar();
    });

    html.on('contextmenu', '.healthbar-segment', (ev) => {
      const segment = ev.currentTarget;
      let json_data = JSON.parse(this.actor.system.healthbar || "[]");
      if (json_data[segment.dataset.healthvalue] == '/') {
        json_data[segment.dataset.healthvalue] = '';
      } else {
        json_data[segment.dataset.healthvalue] = '/';
      }

      this.actor.update({ ['system.healthbar']: JSON.stringify(json_data) });
    });

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  async _resetHealthBar() {
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
  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
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
    return await DieseldrachenItem.create(itemData, { parent: this.actor });
  }



  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;


    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    /*if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }*/

    if (dataset.roll && dataset.rollType == "skill") {
      rollDialogSkillV1(this.actor, dataset.roll, dataset.label);
    }


    if (dataset.rollType == "meleeWeapon") {
      const itemId = element.closest('.item').dataset.itemId;
      rollDialogMeleeWeaponV1(this.actor, itemId, dataset.label);
    }

    if (dataset.rollType == "rangedWeapon") {
      const itemId = element.closest('.item').dataset.itemId;
      rollDialogRangedWeaponV1(this.actor, itemId, dataset.label);
    }

    if(dataset.rollType== "spell"){
      const itemId = element.closest('.item').dataset.itemId;
      const item = this.actor.items.get(itemId);
      this._handleRollSpell(item);
    }

    if(dataset.rollType=="savingThrow"){
      rollDialogSavingThrow1(this.actor, dataset.roll, dataset.label);
    }
  }

  _handleRollSpell(item){
    console.log("_handleRollSpell")
    let label = "Unbekannt";
    let roll = "";
    if(item.system.spellType == 0){
      label = "Körper / Sinne"
      roll = `1d${this.actor.system.attributes.magic}+1d${this.actor.system.abilities.magic_body}`
    }
    else if(item.system.spellType == 1){
      label = "Schicksal / Geister"
      roll = `1d${this.actor.system.attributes.magic}+1d${this.actor.system.abilities.magic_fate}`
    }
    else if(item.system.spellType == 2){
      label = "Elemente / Energie"
      roll = `1d${this.actor.system.attributes.magic}+1d${this.actor.system.abilities.magic_elemental}`
    }
    rollDialogSkillV1(this.actor, roll, label);
  }
}
