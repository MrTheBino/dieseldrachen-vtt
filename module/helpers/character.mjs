export async function doCharacterResting(actor,restValue){
let healthBarJSON = JSON.parse(actor.system.healthbar || "[]");

  let resetValue = restValue;
  let totalRested = 0;
  let lastElement = healthBarJSON.findLastIndex((element) => element == "/")

  if (lastElement != -1) { // nur resten wenn auch Erschöpfung da ist
    for (let x = 0; x < lastElement; x++) {
      if (resetValue > 0) {
        let p = lastElement - x;
        if (p >= 0 && healthBarJSON[p] == "/") {
          healthBarJSON[p] = ""
          totalRested++;
        }
      }
      resetValue--;
    }
    actor.update({ ['system.healthbar']: JSON.stringify(healthBarJSON) });
  }

  return totalRested;
}

export async function doCharacterHealing(actor){
let healthBarJSON = JSON.parse(actor.system.healthbar || "[]");

  let resetValue = actor.system.abilities.condition;
  let totalHealed = 0;
  let lastElement = healthBarJSON.findLastIndex((element) => element == "X")

  if(actor.system.lightInjuries > 0){
    resetValue = resetValue / 2;
  }

  if (lastElement != -1) { // nur resten wenn auch Erschöpfung da ist
    for (let x = 0; x <= lastElement; x++) {
      if (resetValue > 0) {
        let p = lastElement - x;
        if (p >= 0 && healthBarJSON[p] == "X") {
          healthBarJSON[p] = ""
          totalHealed++;
        }
      }
      resetValue--;
    }

    // alle Erschöpfung entfernen
    for (let x = 0; x < healthBarJSON.length; x++) {
      if (healthBarJSON[x] == "/") {
        healthBarJSON[x] = "";
      }
    }

    actor.update({ ['system.healthbar']: JSON.stringify(healthBarJSON) });
  }

  return totalHealed;
}
