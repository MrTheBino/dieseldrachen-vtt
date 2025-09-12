export async function doCharacterResting(actor, restValue) {

  let exhaustionValue = actor.system.exhaustion.value - restValue;
  if (exhaustionValue < 0) {
    exhaustionValue = 0;
  }
  actor.update({ ['system.exhaustion.value']: exhaustionValue })

  return restValue;
}

export async function doCharacterHealing(actor) {
  let resetValue = actor.system.abilities.condition;
  let healedTotal = 0;

  
  if (actor.system.lightInjuries > 0) {
    resetValue = parseInt(resetValue / 2);
  }

  if((actor.system.health.value - resetValue) < 0) {
    healedTotal = actor.system.health.value;
    resetValue = 0
  }else{
    healedTotal = resetValue;
    resetValue = actor.system.health.value - resetValue;
  }

  actor.update({ ['system.health.value']: resetValue })

  return healedTotal;
}
