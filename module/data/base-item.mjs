import DieseldrachenDataModel from "./base-model.mjs";

export default class DieseldrachenItemBase extends DieseldrachenDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.mounted = new fields.BooleanField({ required: true, initial: false });
    schema.description = new fields.StringField({ required: true, blank: true });
    schema.purchasePrice = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0});

    return schema;
  }

}