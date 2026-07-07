import AttackMessageData from '../../data/chatMessage/attackMessageData.js';
import DefenseMessageData from '../../data/chatMessage/defenseMessageData.js';
import { getInteractActor } from '../helper.js';

export function addFumbleContextOptions(html, options) {
    let isFumble = li => {
        const message = game.messages.get(li.dataset.messageId);
        const isMagicalAttack =
            message?.system?.constructor === AttackMessageData && message.system.attack?.attackOption === 'spell';
        return message?.rolls[0]?.options.fumble && !isMagicalAttack;
    };
    options.push({
        label: `${game.i18n.localize('WITCHER.Context.fumble')}`,
        icon: '<i class="fas fa-user-minus"></i>',
        visible: isFumble,
        callback: async li => {
            applyFumble(game.messages.get(li.dataset.messageId));
        }
    });
    return options;
}

function applyFumble(message) {
    switch (message.system.constructor) {
        case DefenseMessageData:
            defenseFumble(message);
            break;
        case AttackMessageData:
            attackFumble(message);
            break;
    }
}

/**
 * Determina la formula di dadi da tirare per i danni all'Affidabilità in base al risultato del Disastro.
 * Tabella Disastri (The Witcher TRPG Core Rulebook):
 *   Attacco in mischia: 8 → 1d10 danni all'Affidabilità
 *   Difesa armata: 6 → 1d6, 9 → 2d6 danni all'Affidabilità
 *
 * Per attacchi a distanza e difese non armate non si applica il danno all'oggetto.
 * @param {number} fumbleAmount
 * @param {'melee'|'ranged'|'defense'} context
 * @returns {string|null} formula Roll oppure null se nessun danno
 */
function getReliabilityDamageFormula(fumbleAmount, context) {
    if (context === 'defense') {
        if (fumbleAmount === 6) return '1d6';
        if (fumbleAmount === 9) return '2d6';
        return null;
    }

    if (context === 'melee') {
        if (fumbleAmount === 8) return '1d10';
        return null;
    }

    return null; // ranged: non si applicano danni all'arma
}

async function applyReliabilityDamage(actor, item, formula, context) {
    if (!item || !formula) return;

    const roll = await new Roll(formula).evaluate();
    const damage = roll.total;

    let fieldKey;
    let currentValue;
    let isBroken;

    if (item.type === 'armor') {
        currentValue = item.system.reliability;
        fieldKey = 'system.reliability';
    } else if (item.type === 'weapon') {
        currentValue = item.system.reliability;
        fieldKey = 'system.reliability';
    } else {
        return;
    }

    const newValue = Math.max(0, currentValue - damage);
    isBroken = newValue <= 0;
    await item.update({ [fieldKey]: newValue });

    // Messaggio in chat visibile a tutti
    const brokenKey = item.type === 'armor' ? 'WITCHER.Shield.Broken' : 'WITCHER.Weapon.Broken';
    let content = `💥 <b>${game.i18n.localize('WITCHER.fumble.reliabilityDamage')}</b><br/>`;
    content += `${game.i18n.localize('WITCHER.Item.ReliabilityLostFumble')}: <b>${item.name}</b> → -${damage} [${formula}]`;
    if (isBroken) {
        content += `<br/>⚠️ <b>${game.i18n.localize(brokenKey)}</b>`;
        ui.notifications.error(`${game.i18n.localize(brokenKey)}: ${item.name}`);
    }

    // Mostriamo il roll in chat
    await roll.toMessage({
        flavor: content,
        speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker()
    });
}

async function attackFumble(message) {
    const fumbleAmount = message.rolls[0].options.fumbleAmount;
    const attack = message.system.attack;
    const actorUuid = message.system.attacker;
    const actor = actorUuid ? await fromUuid(actorUuid) : null;

    let fumbleResult;
    let context = 'melee';

    if (CONFIG.WITCHER.meleeSkills.includes(attack.skill)) {
        if (attack.skill == 'brawling') {
            fumbleResult = unarmedAttackDefense(fumbleAmount);
            context = 'unarmed';
        } else {
            context = 'melee';
            if (fumbleAmount < 6) {
                fumbleResult = 'nothing';
            } else if (fumbleAmount < 10) {
                fumbleResult = 'meleeAttack.' + fumbleAmount;
            } else {
                fumbleResult = 'meleeAttack.>9';
            }
        }
    }

    if (CONFIG.WITCHER.rangedSkills.includes(attack.skill)) {
        context = 'ranged';
        if (fumbleAmount < 6) {
            fumbleResult = 'nothing';
        } else if (fumbleAmount <= 7) {
            fumbleResult = 'rangedAttack.6-7';
        } else if (fumbleAmount <= 9) {
            fumbleResult = 'rangedAttack.8-9';
        } else {
            fumbleResult = 'rangedAttack.>9';
        }
    }

    //magical fumble
    if (attack.attackOption === 'spell') {
        if (fumbleAmount < 7) {
            fumbleResult = 'magic.1-6';
        } else if (fumbleAmount < 10) {
            fumbleResult = 'magic.7-9';
        } else {
            fumbleResult = 'magic.>9';
        }
    }

    await createResultMessage(actor, fumbleResult);

    // Applica danni all'Affidabilità dell'arma usata per l'attacco
    if (context === 'melee' && attack.itemUuid) {
        const item = await fromUuid(attack.itemUuid);
        const formula = getReliabilityDamageFormula(fumbleAmount, 'melee');
        if (formula && item) {
            await applyReliabilityDamage(actor, item, formula, 'melee');
        }
    }
}

async function defenseFumble(message) {
    const fumbleAmount = message.rolls[0].options.fumbleAmount;
    const actorUuid = message.system.defender;
    const actor = actorUuid ? await fromUuid(actorUuid) : null;

    if (fumbleAmount < 6) {
        await createResultMessage(actor, 'nothing');
        return;
    }

    let fumbleResult;
    let isArmedDefense = false;

    if (CONFIG.WITCHER.meleeSkills.includes(message.system.defense) && message.system.defense != 'brawling') {
        isArmedDefense = true;
        if (fumbleAmount < 9) {
            fumbleResult = 'armedDefense.' + fumbleAmount;
        } else {
            fumbleResult = 'armedDefense.>9';
        }
    } else {
        fumbleResult = unarmedAttackDefense(fumbleAmount);
    }

    await createResultMessage(actor, fumbleResult);

    // Applica danni all'Affidabilità dello scudo/arma usata per la difesa, se armata
    if (isArmedDefense && actor) {
        // Recuperiamo l'oggetto usato per la difesa cercandolo nell'inventario dell'attore
        // (lo scudo o l'arma equipaggiata)
        const defenseItem = actor.items.find(i =>
            (i.type === 'weapon' || i.type === 'armor') &&
            (i.system.equipped || i.system.equippedOffHand)
        );
        const formula = getReliabilityDamageFormula(fumbleAmount, 'defense');
        if (formula && defenseItem) {
            await applyReliabilityDamage(actor, defenseItem, formula, 'defense');
        }
    }
}

function unarmedAttackDefense(fumbleAmount) {
    let fumbleResult;
    if (fumbleAmount < 6) {
        fumbleResult = 'nothing';
    } else if (fumbleAmount >= 6 && fumbleAmount <= 9) {
        fumbleResult = 'unarmed.' + fumbleAmount;
    } else {
        fumbleResult = 'unarmed.>9';
    }

    return fumbleResult;
}

async function createResultMessage(actor, result) {
    const content = `<div>${game.i18n.localize('WITCHER.fumbleResults.name')}: ${game.i18n.localize('WITCHER.fumbleResults.' + result)}</div>`;

    const chatData = {
        user: game.user.id,
        content: content,
        speaker: actor ? ChatMessage.getSpeaker({ actor: actor }) : ChatMessage.getSpeaker(),
        ...(typeof CONST.CHAT_MESSAGE_STYLES !== "undefined" ? { style: CONST.CHAT_MESSAGE_STYLES.OTHER } : { type: CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0 })
    };

    ChatMessage.create(chatData);
}
