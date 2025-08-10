import DieseldrachenItemBase from "./base-item.mjs";

export default class DieseldrachenKnowledge extends DieseldrachenItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();


    schema.isLanguage = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.level = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 100 });

    return schema;
  }
}