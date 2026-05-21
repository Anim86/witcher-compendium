import { emitForGM } from '../socket/socketMessage.js';

export async function applyActiveEffectToTargets(activeEffects, duration) {
    let targets = game.user.targets;

    if (targets.size == 0) return;

    targets.forEach(target => {
        let actorUuid = target.actor.uuid;
        applyActiveEffectToActor(actorUuid, activeEffects, duration);
    });
}

export async function applyActiveEffectToActorViaId(actorUuid, itemUuid, applyWhen, duration) {
    let item = fromUuidSync(itemUuid);

    if (!item) {
        sendToGm('applyActiveEffectToActorViaId', actorUuid, itemUuid, applyWhen, duration);
        return;
    }

    applyActiveEffectToActor(
        actorUuid,
        item.effects.filter(effect => effect.system[applyWhen]),
        duration,
        item
    );
}

export async function applyActiveEffectToActor(actorUuid, activeEffects, duration, originItem = null) {
    let actor = fromUuidSync(actorUuid);

    if (!actor) return;

    applyTemporaryItemImprovements(actor, activeEffects);

    if (!actor.isOwner) {
        sendToGm(
            'applyActiveEffectToActor',
            actorUuid,
            activeEffects.filter(effect => effect.type != 'temporaryItemImprovement')
        );
        return;
    }

    const parsedDuration = originItem ? parseDuration(originItem.system.time) : {};

    let newEffects = activeEffects
        .filter(effect => effect.type != 'temporaryItemImprovement')
        .map(effect => {
            const updateData = {
                'duration.combat': ui.combat?.combats?.find(combat => combat.isActive)?.id,
                'system.applySelf': false,
                'system.applyOnTarget': false,
                'system.applyOnHit': false,
                'system.applyOnDamage': false
            };

            if (duration) {
                if (typeof duration === 'object') {
                    if (duration.rounds) updateData['duration.rounds'] = duration.rounds;
                    if (duration.seconds) updateData['duration.seconds'] = duration.seconds;
                } else {
                    updateData['duration.rounds'] = duration;
                }
            } else if (parsedDuration) {
                if (parsedDuration.rounds) updateData['duration.rounds'] = parsedDuration.rounds;
                if (parsedDuration.seconds) updateData['duration.seconds'] = parsedDuration.seconds;
            }

            return effect.clone(updateData, { parent: actor });
        });

    await actor.createEmbeddedDocuments('ActiveEffect', newEffects);
}

export function parseDuration(timeStr) {
    if (!timeStr) return {};
    const normalized = timeStr.toLowerCase().trim();
    
    // Check for rounds
    const roundMatch = normalized.match(/^(\d+)\s*round/);
    if (roundMatch) {
        return { rounds: parseInt(roundMatch[1]) };
    }
    
    // Check for minutes/minuti
    const minuteMatch = normalized.match(/^(\d+)\s*minut/);
    if (minuteMatch) {
        return { seconds: parseInt(minuteMatch[1]) * 60 };
    }
    
    // Check for hours/ore
    const hourMatch = normalized.match(/^(\d+)\s*ore/);
    if (hourMatch) {
        return { seconds: parseInt(hourMatch[1]) * 3600 };
    }
    const hourEngMatch = normalized.match(/^(\d+)\s*hour/);
    if (hourEngMatch) {
        return { seconds: parseInt(hourEngMatch[1]) * 3600 };
    }
    
    // Check for ½ ora or 1/2 ora
    if (normalized.includes('½ ora') || normalized.includes('1/2 ora') || normalized.includes('1/2 hour') || normalized.includes('30 min') || normalized.includes('30-min')) {
        return { seconds: 1800 };
    }
    
    return {};
}

export async function applyToxicityToActor(actorUuid, itemUuid) {
    let actor = fromUuidSync(actorUuid);
    if (!actor) return;

    if (!actor.isOwner) {
        emitForGM('applyToxicityToActor', [actorUuid, itemUuid]);
        return;
    }

    let item = fromUuidSync(itemUuid);
    if (!item) return;

    const toxicity = parseInt(item.system.toxicity);
    if (isNaN(toxicity) || toxicity <= 0) return;

    const duration = parseDuration(item.system.time);

    const effectData = {
        name: `${game.i18n.localize('WITCHER.Actor.Stat.Toxicity')}: ${item.name}`,
        img: item.img || 'icons/svg/item-bag.svg',
        origin: item.uuid,
        duration: {
            ...duration,
            combat: ui.combat?.combats?.find(combat => combat.isActive)?.id
        },
        system: {
            toxicity: toxicity,
            applySelf: false,
            applyOnTarget: false,
            applyOnHit: false,
            applyOnDamage: false
        }
    };

    const createdEffects = await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
    return createdEffects[0]?.id;
}

async function applyTemporaryItemImprovements(actor, activeEffects) {
    if (!actor.isOwner) {
        getActorOwner(actor).query('TheWitcherItaNewSystem.applyTemporaryItemImprovements', {
            actorUuid: actor.uuid,
            effects: activeEffects
        });
        return;
    }

    actor.applyTemporaryItemImprovements(activeEffects);
}

function getActorOwner(actor) {
    let owner = game.users.activeGM;
    if (actor.hasPlayerOwner) {
        owner = game.users.find(e => actor.testUserPermission(e, 'OWNER') && !e.isGM);
    }
    return owner;
}

function sendToGm(call, actorUuid, activeEffects, duration) {
    emitForGM(call, [actorUuid, activeEffects, duration]);
}
