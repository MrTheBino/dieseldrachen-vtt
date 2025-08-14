import DieseldrachenItemBase from "./base-item.mjs";

export default class DieseldrachenNpcSpecialDice extends DieseldrachenItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.specialDice = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 4, min: 0, max: 12 });

    return schema;
  }
}