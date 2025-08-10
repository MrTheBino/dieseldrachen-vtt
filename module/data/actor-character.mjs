import DieseldrachenActorBase from "./base-actor.mjs";

export default class DieseldrachenCharacter extends DieseldrachenActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.luck =  new fields.NumberField({ ...requiredInteger, initial: 0, max: 3 });
    schema.xp =  new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.money =  new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.age =  new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.species = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.nation = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.profession = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.look = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.spleen = new fields.StringField({ required: true, blank: true, initial: "" });

    schema.attributes = new fields.SchemaField({
        athletics: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        skill: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        reaction: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        charisma: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        intuition: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        reason: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        magic: new fields.NumberField({ ...requiredInteger, initial: 4 }),
    });

    schema.social = new fields.SchemaField({
      group: new fields.SchemaField({
        name: new fields.StringField({ required: true, blank: true, initial: ""}),
        value_pos: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        value_neg: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      contacts: new fields.SchemaField({
        name: new fields.StringField({ required: true, blank: true, initial: ""}),
        value_pos: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        value_neg: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      reputation: new fields.SchemaField({
        name: new fields.StringField({ required: true, blank: true, initial: ""}),
        value_pos: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        value_neg: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      standing: new fields.SchemaField({
        name: new fields.StringField({ required: true, blank: true, initial: ""}),
        value_pos: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        value_neg: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      wealth: new fields.SchemaField({
        name: new fields.StringField({ required: true, blank: true, initial: ""}),
        value_pos: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        value_neg: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      })
    })

    schema.abilities = new fields.SchemaField({
        // athletics
        strength: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        agility: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        condition: new fields.NumberField({ ...requiredInteger, initial: 4 }),

        // skill
        pistols: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        rifles: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        sleight_of_hand: new fields.NumberField({ ...requiredInteger, initial: 4 }),

        // reaction
        brawl: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        fencing: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        steering: new fields.NumberField({ ...requiredInteger, initial: 4 }),

        // charisma
        persuade: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        drama: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        society: new fields.NumberField({ ...requiredInteger, initial: 4 }),

        // intuition
        orientation: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        stealth: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        alertness: new fields.NumberField({ ...requiredInteger, initial: 4 }),

        // reason
        knowledge: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        willpower: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        searching: new fields.NumberField({ ...requiredInteger, initial: 4 }),

        // magic
        magic_body: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        magic_fate: new fields.NumberField({ ...requiredInteger, initial: 4 }),
        magic_elemental: new fields.NumberField({ ...requiredInteger, initial: 4 })
    });

    return schema;
  }

  prepareDerivedData() {
    /*
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor((this.abilities[key].value - 10) / 2);
      // Handle ability label localization.
      this.abilities[key].label = game.i18n.localize(CONFIG.DIESELDRACHEN.abilities[key]) ?? key;
    }*/
  }

  getRollData() {
    const data = {};

    /*
    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;
    */
    return data
  }
}