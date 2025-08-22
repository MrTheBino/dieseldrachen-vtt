import DieseldrachenItemBase from "./base-item.mjs";

export default class DieseldrachenRangedWeapon extends DieseldrachenItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    const requiredInteger = { required: true, nullable: false, integer: true };

    schema.weight = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.weaponType = new fields.StringField({ required: true, blank: true, initial: "pistol" });
    schema.precision_near = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 4, min: 0, max: 100 });
    schema.precision_close = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 4, min: 0, max: 100 });
    schema.precision_far = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 4, min: 0, max: 100 });

    schema.damage_near = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.damage_close = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.damage_far = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });

    schema.bullets = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      perReload: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 100 })
    })
    
    schema.rate = new fields.StringField({ required: true, blank: true, initial: "" });
    schema.capacity = new fields.StringField({ required: true, blank: true, initial: "" });

    return schema;
  }

  prepareDerivedData() {
    
    if(this.capacity && this.capacity !== "") {
        let [v1, v2] = this.capacity.split("x");
        if(v2 === undefined){
          this.bullets.max = parseInt(v1);
          this.bullets.perReload = 1;
          return;
        }
        
        if(parseInt(v1) > parseInt(v2)){
          this.bullets.max = parseInt(v1);
          this.bullets.perReload = 1
        }else{
          this.bullets.max = parseInt(v2);
          this.bullets.perReload = parseInt(v2);
        }
    }
    else{
      this.bullets.max = 0;
      this.bullets.perReload = 0;
    }
  }
}