export class DieseldrachenCombat extends Combat {
    async rollInitiative(ids, options = {}) {

        const updates = [];

        for (const id of ids) {
            const combatant = this.combatants.get(id, { strict: true });

            let numSuccesses = 2;
            if(combatant.actor.type == "npc"){
                numSuccesses = 1;
            }

            const updateData = {
                initiative: numSuccesses
            };
            updates.push({ _id: combatant.id, ...updateData });

        } // each ids

        
        // Updates the combatants.
        await this.updateEmbeddedDocuments('Combatant', updates);
        return this;
    }
}