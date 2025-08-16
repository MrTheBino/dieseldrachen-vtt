import DieseldrachenActorBase from "./base-actor.mjs";

export default class DieseldrachenNPC extends DieseldrachenActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.cr = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
    schema.xp = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

    schema.species = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.dice = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 6, min: 1, max: 100 });
    schema.armor = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 100 });

    schema.healthbar = new fields.StringField({ required: true, blank: true, initial: "[]" });
    
    return schema
  }

  prepareDerivedData() {
    this.xp = this.cr * this.cr * 100;
  }
}