import DieseldrachenItemBase from "./base-item.mjs";

export default class DieseldrachenArtefact extends DieseldrachenItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.weight = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });
    schema.charges = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
    })
    schema.magicType = new fields.StringField({ required: true, blank: true, initial: "" });

    return schema;
  }
}