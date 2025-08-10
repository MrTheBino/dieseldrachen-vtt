import DieseldrachenItemBase from "./base-item.mjs";

export default class DieseldrachenClothing extends DieseldrachenItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.mobilityDice = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.armor = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 100 });

    return schema;
  }
}