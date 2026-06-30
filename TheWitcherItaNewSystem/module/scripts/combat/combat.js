import { getInteractActor } from '../helper.js';
import { ApplyNormalDamage, ApplyNonLethalDamage } from './applyDamage.js';

export function addAttackChatListeners(html) {
    // setup chat listener messages for each message as some need the message context instead of chatlog context.
    html.querySelectorAll('.chat-message').forEach(async (element) => {
        const id = element.dataset.messageId;
        const message = game.messages?.get(id);
        if (!message) return;

        await attackChatMessageListeners(message, element);
    });
}

export const attackChatMessageListeners = async (message, html) => {
    html.querySelector('button.damage')?.addEventListener('click', _ => onDamage(message));
    html.querySelector('button.defend')?.addEventListener('click', async _ => {
        executeDefense(await getInteractActor(), message.id);
    });
    html.querySelector('button.apply-damage')?.addEventListener('click', async _ => {
        ApplyNormalDamage(await getInteractActor(), parseInt(html.querySelector('.dice-total')?.innerText || 0), message.id);
    });
    html.querySelector('button.apply-non-lethal-damage')?.addEventListener('click', async _ => {
        ApplyNonLethalDamage(await getInteractActor(), parseInt(html.querySelector('.dice-total')?.innerText || 0), message.id);
    });
};

function onDamage(message) {
    let item = fromUuidSync(message.system.attack.itemUuid);
    let damage = message.system.damage;

    item.rollDamage(damage);
}

export const defenseChatMessageListeners = async (message, html) => {
    html.querySelectorAll('button.stun').forEach(button =>
        button.addEventListener('click', async _ => {
            (await getInteractActor()).stunSave(message.system.attackWeaponProperties.stun);
        })
    );

    html.querySelectorAll('button.crit-stun').forEach(button =>
        button.addEventListener('click', async _ => {
            (await getInteractActor()).stunSave();
        })
    );

    html.querySelectorAll('button.crit-apply-dmg').forEach(button =>
        button.addEventListener('click', async _ => {
            (await getInteractActor()).applyCritDamage(message.system.crit);
        })
    );

    html.querySelectorAll('button.crit-apply-wound').forEach(button =>
        button.addEventListener('click', async _ => {
            (await getInteractActor()).applyCritWound(message.system.crit);
        })
    );

    html.querySelectorAll('a.crit-apply-bonus-dmg').forEach(button =>
        button.addEventListener('click', async _ => {
            (await getInteractActor()).applyBonusCritDamage(message.system.crit);
        })
    );
};

export function addDefenseOptionsContextMenu(html, options) {
    let canDefend = li => Array.from(game.messages.get(li.dataset.messageId)?.system?.defenseOptions ?? []).length > 0;
    const entry = {
        label: `${game.i18n.localize('WITCHER.Context.Defense')}`,
        icon: '<i class="fas fa-shield-alt"></i>',
        visible: canDefend
    };
    const callback = async li => {
        executeDefense(await getInteractActor(), li.dataset.messageId);
    };
    if (!game.version || game.version.startsWith("14") || game.version.startsWith("15") || game.version.startsWith("16")) {
        entry.onClick = callback;
    } else {
        entry.callback = callback;
    }
    options.push(entry);
    return options;
}

async function executeDefense(actor, messageId) {
    if (!actor) return;

    let message = game.messages.get(messageId);

    actor.prepareAndExecuteDefense(
        message.system.attack,
        message.system.defenseOptions,
        message.system.damage,
        message.system.attackRoll,
        message.system.attacker
    );
}

export function addCritMessageContextOptions(html, options) {
    let wasCritted = li => li.querySelector('.crit-taken');
    const entries = [
        {
            label: `${game.i18n.localize('WITCHER.Context.applyCritDmg')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            visible: wasCritted,
            callback: async li => {
                (await getInteractActor()).applyCritDamage(game.messages.get(li.dataset.messageId).system.crit);
            }
        },
        {
            label: `${game.i18n.localize('WITCHER.Context.applyBonusCritDmg')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            visible: wasCritted,
            callback: async li => {
                (await getInteractActor()).applyBonusCritDamage(game.messages.get(li.dataset.messageId).system.crit);
            }
        },
        {
            label: `${game.i18n.localize('WITCHER.Context.applyCritWound')}`,
            icon: '<i class="fas fa-user-minus"></i>',
            visible: wasCritted,
            callback: async li => {
                (await getInteractActor()).applyCritWound(game.messages.get(li.dataset.messageId).system.crit);
            }
        }
    ];

    const isV14 = !game.version || game.version.startsWith("14") || game.version.startsWith("15") || game.version.startsWith("16");
    for (const entry of entries) {
        if (isV14) {
            entry.onClick = entry.callback;
            delete entry.callback;
        }
    }
    options.push(...entries);
    return options;
}
