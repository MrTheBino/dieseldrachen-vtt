import DieseldrachenItemBase from "./base-item.mjs";

export default class DieseldrachenHandGrenade extends DieseldrachenItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.handling = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 4, min: 4, max: 100 });
    schema.damage = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });

    return schema;
  }
}