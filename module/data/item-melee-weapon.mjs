import DieseldrachenItemBase from "./base-item.mjs";

export default class DieseldrachenClothing extends DieseldrachenItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.weight = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.range = new fields.StringField({ required: true, blank: true, initial: "short" });
    schema.weaponWeight = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 100 });
    schema.damage = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.ability = new fields.StringField({ required: true, blank: true, initial: "brawl" });

    return schema;
  }
}