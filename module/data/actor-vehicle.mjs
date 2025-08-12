import DieseldrachenActorBase from "./base-actor.mjs";

export default class DieseldrachenVehicle extends DieseldrachenActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();


    schema.type = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.model = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.location = new fields.StringField({ required: true, nullable: false, initial: "" });


    schema.acceleration = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.mass = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.armor = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.seats = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

    schema.agility = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

    schema.size = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    
    schema.condition = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.conditionText = new fields.StringField({ required: true, nullable: false, initial: "" });

    schema.fireSmoke = new fields.BooleanField({ required: true, nullable: false, initial: false });


     schema.speed = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
    })

     schema.stability = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
    })

     schema.motors = new fields.SchemaField({
      damage: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 4, min: 1 , max: 4}),
    })

    schema.tireWing = new fields.NumberField({ ...requiredInteger, initial: 0, mmax: 4 })

    return schema
  }

  prepareDerivedData() {
    
  }
}