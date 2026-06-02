import { createLabeledInput, createLabeledSelect } from '../htmlUtils.js';

const DialogV2 = foundry.applications.api.DialogV2;

export default class Rewards {
    static getPlayerActors() {
        return game.actors.filter(actor => actor.hasPlayerOwner);
    }

    static async ipRewardDialog(actors, type = 'standard') {
        if (!actors) {
            actors = this.getPlayerActors();
        }

        const isMagic = type === 'magic';
        const title = isMagic ? 'WITCHER.rewards.dialog.titleMagic' : 'WITCHER.rewards.dialog.titleStandard';
        const ipLabel = isMagic ? 'Punti Magia (PM)' : 'Punti Incremento (PI)';
        const icon = isMagic ? 'fa-sparkles' : 'fa-graduation-cap';
        const themeClass = isMagic ? 'magic-theme' : 'standard-theme';

        let content = `
        <div class="rewards-dialog-premium ${themeClass}">
            <div class="rewards-targets">
                <label class="section-label"><i class="fas fa-users"></i> Destinatari</label>
                <div class="targets-grid">
        `;

        actors.forEach(actor => {
            content += `
                <label class="target-checkbox">
                    <input type="checkbox" name="actors" value="${actor.uuid}" checked>
                    <span class="target-name">${actor.name}</span>
                </label>
            `;
        });

        content += `
                </div>
            </div>

            <div class="reward-details">
                <div class="form-group-premium">
                    <label><i class="fas fa-pen-nib"></i> ${game.i18n.localize('WITCHER.rewards.dialog.label')}</label>
                    <input type="text" name="label" placeholder="Es: Luogo di Potere, Fine Sessione..." />
                </div>
                
                <div class="reward-value-row">
                    <div class="form-group-premium">
                        <label><i class="fas ${icon}"></i> ${ipLabel}</label>
                        <input type="number" name="ip" value="0" min="1" />
                    </div>
                </div>
            </div>
            
            <input type="hidden" name="isMagic" value="${isMagic ? 'true' : 'false'}" />
        </div>
        `;

        let values = await DialogV2.input({
            window: {
                title: game.i18n.localize(title),
                icon: icon,
                classes: ['witcher-dialog-v2', 'rewards-v2']
            },
            content: content,
            ok: {
                label: `${game.i18n.localize('WITCHER.rewards.dialog.confirm')}`,
                icon: 'fa-solid fa-floppy-disk'
            }
        });

        if (values) {
            // Fix checkboxes from createMultiSelectInput if we used it, but here we used raw HTML
            // DialogV2.input returns an object with the names of the inputs
            // If multiple checkboxes have the same name, it might be an array or a single value
            // We need to ensure it's an array for actors
        }

        return values;
    }

    static async handoutIpRewards(actors, type = 'standard') {
        if (!game.user.isGM) return;

        let values = await Rewards.ipRewardDialog(actors, type);

        if (!values || !values.actors || (Array.isArray(values.actors) && values.actors.length === 0)) return;

        // Ensure actors is always an array
        const actorUuids = Array.isArray(values.actors) ? values.actors : [values.actors];
        let choosenActors = actorUuids.map(uuid => fromUuidSync(uuid));
        let ip = values.ip;
        let label = values.label;
        let isMagic = values.isMagic === 'true' || values.isMagic === true;

        if (ip) {
            choosenActors.forEach(actor => actor.system.logs.addIpReward(label, ip, isMagic));
        }

        const content = await foundry.applications.handlebars.renderTemplate(
            'systems/TheWitcherItaNewSystem/templates/chat/rewards.hbs',
            {
                actors: choosenActors,
                label: label,
                ip: ip
            }
        );
        let whisperUsers = game.users.filter(u => u.isGM || choosenActors.some(a => a.testUserPermission(u, "OWNER"))).map(u => u.id);

        const chatData = {
            content: content,
            whisper: whisperUsers,
            ...(typeof CONST.CHAT_MESSAGE_STYLES !== "undefined" ? { style: CONST.CHAT_MESSAGE_STYLES.OTHER } : { type: CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0 })
        };

        if (ip) {
            ChatMessage.create(chatData);
        }
    }

    static async currencyRewardDialog(actors) {
        if (!actors) {
            actors = this.getPlayerActors();
        }

        let content = `
        <div class="rewards-dialog-premium currency-theme">
            <div class="rewards-targets">
                <label class="section-label"><i class="fas fa-users"></i> Destinatari</label>
                <div class="targets-grid">
        `;

        actors.forEach(actor => {
            content += `
                <label class="target-checkbox">
                    <input type="checkbox" name="actors" value="${actor.uuid}" checked>
                    <span class="target-name">${actor.name}</span>
                </label>
            `;
        });

        content += `
                </div>
            </div>

            <div class="reward-details">
                <div class="reward-value-row">
                    <div class="form-group-premium">
                        <label><i class="fas fa-coins"></i> Corone (+/-)</label>
                        <input type="number" name="amount" value="0" />
                    </div>
                </div>
            </div>
        </div>
        `;

        let values = await DialogV2.input({
            window: {
                title: "Assegna Corone",
                icon: "fa-solid fa-coins",
                classes: ['witcher-dialog-v2', 'rewards-v2']
            },
            content: content,
            ok: {
                label: "Conferma",
                icon: "fa-solid fa-floppy-disk"
            }
        });

        return values;
    }

    static async handoutCurrencyRewards(actors) {
        let values = await Rewards.currencyRewardDialog(actors);

        if (!values || !values.actors || (Array.isArray(values.actors) && values.actors.length === 0)) return;

        const actorUuids = Array.isArray(values.actors) ? values.actors : [values.actors];
        let choosenActors = actorUuids.map(uuid => fromUuidSync(uuid));
        let amount = parseInt(values.amount);
        let label = "Assegnazione Corone";

        if (amount) {
            for (let actor of choosenActors) {
                let current = actor.system.currency.crown || 0;
                let newValue = Math.max(0, current + amount);
                await actor.update({ "system.currency.crown": newValue });
            }

            const content = await foundry.applications.handlebars.renderTemplate(
                'systems/TheWitcherItaNewSystem/templates/chat/rewards.hbs',
                {
                    actors: choosenActors,
                    label: label,
                    currency: true,
                    amount: amount,
                    type: "crown"
                }
            );

            let whisperUsers = game.users.filter(u => u.isGM || choosenActors.some(a => a.testUserPermission(u, "OWNER"))).map(u => u.id);

            const chatData = {
                content: content,
                whisper: whisperUsers,
                ...(typeof CONST.CHAT_MESSAGE_STYLES !== "undefined" ? { style: CONST.CHAT_MESSAGE_STYLES.OTHER } : { type: CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0 })
            };

            ChatMessage.create(chatData);
        }
    }
}
