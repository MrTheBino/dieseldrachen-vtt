import DieseldrachenItemBase from "./base-item.mjs";

export default class DieseldrachenClothing extends DieseldrachenItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.weight = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.weaponType = new fields.StringField({ required: true, blank: true, initial: "pistol" });
    schema.precision_near = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.precision_close = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.precision_far = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });

    schema.damage_near = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.damage_close = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.damage_far = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });

    schema.bullets = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 100 });
    schema.rate = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.capacity = new fields.StringField({ required: true, blank: true, initial: "" });

    return schema;
  }
}