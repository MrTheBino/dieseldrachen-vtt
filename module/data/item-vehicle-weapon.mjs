import DieseldrachenItemBase from "./base-item.mjs";

export default class DieseldrachenVehicleWeapon extends DieseldrachenItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.precision_near = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 4, min: 0, max: 100 });
    schema.precision_close = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 4, min: 0, max: 100 });
    schema.precision_far = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 4, min: 0, max: 100 });

    schema.damage_near = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.damage_close = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.damage_far = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });

    schema.rate = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.lage = new fields.StringField({ required: true, blank: true, initial: "" });

    return schema;
  }
}