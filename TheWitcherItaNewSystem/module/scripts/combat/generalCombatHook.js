import { applyDamageFromStatus } from '../combat/applyDamage.js';

export async function applyGeneralCombatHooks(combat, update) {
    if (!game.user.isGM) return;
    
    // Assicuriamoci di applicare gli effetti solo quando cambia effettivamente il turno o il round
    if (update && update.turn === undefined && update.round === undefined) return;

    let actor = combat.combatants.get(combat.current.combatantId).actor;
    applyMonsterRegeneration(actor);
    applyCombatEffects(actor);
    applyVigorReset(actor);
}

async function applyVigorReset(actor) {
    if (!actor || !actor.system.derivedStats?.vigor) return;
    await actor.update({
        'system.derivedStats.vigor.value': actor.system.derivedStats.vigor.max
    });
}

async function applyMonsterRegeneration(actor) {
    if (actor.type != 'monster') return;
    if (actor.system.regeneration === 0) return;
    if (actor.statuses.has('dead')) return;

    const content = await foundry.applications.handlebars.renderTemplate(
        'systems/TheWitcherItaNewSystem/templates/chat/combat/regeneration.hbs',
        {
            actor: actor
        }
    );

    const chatData = {
        content: content,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flags: actor.getDamageFlags(),
        whisper: [game.user.id],
        ...(typeof CONST.CHAT_MESSAGE_STYLES !== "undefined" ? { style: CONST.CHAT_MESSAGE_STYLES.OTHER } : { type: CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0 })
    };

    ChatMessage.create(chatData);

    actor.update({
        'system.derivedStats.hp.value': Math.min(
            actor.system.derivedStats.hp.value + actor.system.regeneration,
            actor.system.derivedStats.hp.max
        )
    });
}

async function applyCombatEffects(actor) {
    for (const status of Object.values(actor.system.combatEffects.turnStartEffects)) {
        await applyCombatEffect(actor, status);
    }
}

async function applyCombatEffect(actor, status) {
    if (!status.heal?.amount && !status.damage?.amount) return;
    const content = await foundry.applications.handlebars.renderTemplate(
        'systems/TheWitcherItaNewSystem/templates/chat/combat/statusEffect.hbs',
        status
    );
    const chatData = {
        content: content,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flags: actor.getDamageFlags(),
        ...(typeof CONST.CHAT_MESSAGE_STYLES !== "undefined" ? { style: CONST.CHAT_MESSAGE_STYLES.OTHER } : { type: CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0 })
    };

    (ChatMessage.applyMode ?? ChatMessage.applyRollMode)(chatData, game.settings.get('core', 'rollMode'));
    ChatMessage.create(chatData);

    if (status.damage && status.damage.amount > 0) {
        let damage = {
            properties: {
                spDamage: status.damage.spDamage,
                damageToAllLocations: status.damage.allLocations,
                effects: [],
                bypassesNaturalArmor: status.damage.ignoreArmor,
                bypassesWornArmor: status.damage.ignoreArmor
            },
            location: actor.getLocationObject('torso')
        };
        if (status.damage.nonLethal) {
            await applyDamageFromStatus(actor, status.damage.amount + (status.damage.modifier ?? 0), damage, 'sta');
        } else {
            await applyDamageFromStatus(actor, status.damage.amount + (status.damage.modifier ?? 0), damage, 'hp');
        }
    }

    if (status.heal && status.heal.amount > 0) {
        let healedFor = await actor.calculateHealValue(status.heal.amount);
        if (healedFor > 0) {
            await actor.update({ 'system.derivedStats.hp.value': actor.system.derivedStats.hp.value + healedFor });
            await actor.createHealMessage(healedFor);
        }
    }
}
