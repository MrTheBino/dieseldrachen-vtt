import DieseldrachenItemBase from "./base-item.mjs";

export default class DieseldrachenSpell extends DieseldrachenItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.spellLevel = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 9 });
    schema.spellType = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 2 });

    return schema;
  }
}