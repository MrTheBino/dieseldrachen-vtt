import DieseldrachenItemBase from "./base-item.mjs";

export default class DieseldrachenTechnicManeuver extends DieseldrachenItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.dice = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.restriction = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.type = new fields.StringField({ required: true, blank: true, initial: "" });

    return schema;
  }
}