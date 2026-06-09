export async function countdownDurationOfRegions(combat, update, options, userId) {
    if (!game.user.isGM) return;

    const combatantId = combat.current?.combatantId;
    if (!combatantId) return;

    const combatant = combat.combatants.get(combatantId);
    if (!combatant || !combatant.actor) return;

    let actorUuid = combatant.actor.uuid;

    let toDelete = [];
    game.scenes.active.regions
        .filter(region => region.flags.TheWitcherItaNewSystem.actorUuid === actorUuid)
        .forEach(region => {
            if (region.flags.TheWitcherItaNewSystem.duration - 1 > 0) {
                region.setFlag('TheWitcherItaNewSystem', 'duration', region.flags.TheWitcherItaNewSystem.duration - 1);
            } else {
                toDelete.push(region.id);
            }
        });

    game.scenes.active.deleteEmbeddedDocuments('Region', toDelete);
}
