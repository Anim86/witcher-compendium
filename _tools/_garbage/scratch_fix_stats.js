
async function fixActorStats() {
    for (let actor of game.actors) {
        console.log(`Fixing actor: ${actor.name}`);
        const updateData = {};
        
        // Fix base stats
        for (let s of ['int', 'ref', 'dex', 'body', 'spd', 'emp', 'cra', 'will', 'luck', 'toxicity']) {
            const stat = actor.system.stats[s];
            if (stat && (stat.unmodifiedMax === 0 || !stat.unmodifiedMax)) {
                if (stat.max > 0) {
                    updateData[`system.stats.${s}.unmodifiedMax`] = stat.max;
                }
            }
        }
        
        // Fix derived stats
        for (let s of ['stun', 'run', 'leap', 'enc', 'rec', 'woundTreshold', 'vigor']) {
            const stat = actor.system.derivedStats[s];
            if (stat && (stat.unmodifiedMax === 0 || !stat.unmodifiedMax)) {
                if (stat.max > 0) {
                    updateData[`system.derivedStats.${s}.unmodifiedMax`] = stat.max;
                }
            }
        }
        
        if (Object.keys(updateData).length > 0) {
            console.log(`Updating ${actor.name}:`, updateData);
            await actor.update(updateData);
        }
    }
    ui.notifications.info("All actors' stats have been verified and fixed.");
}

fixActorStats();
