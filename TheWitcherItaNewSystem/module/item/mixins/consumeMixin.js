import { applyActiveEffectToActorViaId } from '../../scripts/temporaryEffects/applyActiveEffect.js';

export let consumeMixin = {
    async consume() {
        let properties = this.system.consumeProperties;
        const img = this.img || 'icons/svg/item-bag.svg';
        const name = this.name || '';
        const description = this.system.description || '';
        const toxicity = this.system.toxicity || '';
        
        let propertiesHtml = '';
        
        // Healing
        if (properties.doesHeal && properties.heal) {
            propertiesHtml += `
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-weight: bold; color: #4caf50;"><i class="fas fa-heartbeat"></i> Cura:</span>
                    <span>${properties.heal} PS</span>
                </div>
            `;
        }
        
        // Temporary HP
        if (properties.addsTempHp && properties.temporaryHp && properties.temporaryHp.value) {
            propertiesHtml += `
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-weight: bold; color: #2196f3;"><i class="fas fa-shield-alt"></i> PF Temporanei:</span>
                    <span>+${properties.temporaryHp.value} PF (Durata: ${properties.temporaryHp.duration} turni)</span>
                </div>
            `;
        }
        
        // Toxicity - based exclusively on the item's toxicity tag
        if (toxicity && toxicity !== '0' && toxicity !== 'N/A') {
            const displayTox = toxicity.startsWith('+') ? toxicity : `+${toxicity}`;
            propertiesHtml += `
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-weight: bold; color: #9c27b0;"><i class="fas fa-skull-crossbones"></i> Tossicità:</span>
                    <span>${displayTox}</span>
                </div>
            `;
        }
        
        // Status Effects
        const statusEffects = properties.effects ? properties.effects.map(effect => {
            const ce = CONFIG.WITCHER.statusEffects.find(configEffect => configEffect.id == effect.statusEffect);
            return ce ? game.i18n.localize(ce.name) : effect.name;
        }).filter(Boolean) : [];
        
        if (statusEffects.length > 0) {
            propertiesHtml += `
                <div style="display: flex; flex-direction: column; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-weight: bold; color: #ff9800;"><i class="fas fa-virus"></i> Applica Effetti di Stato:</span>
                    <span style="padding-left: 15px; font-style: italic;">${statusEffects.join(', ')}</span>
                </div>
            `;
        }
        
        // Removes Effects
        const removesEffects = properties.removesEffects ? properties.removesEffects.map(effectId => {
            const ce = CONFIG.WITCHER.statusEffects.find(configEffect => configEffect.id == effectId);
            return ce ? game.i18n.localize(ce.name) : effectId;
        }).filter(Boolean) : [];
        
        if (removesEffects.length > 0) {
            propertiesHtml += `
                <div style="display: flex; flex-direction: column; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-weight: bold; color: #00bcd4;"><i class="fas fa-hand-holding-medical"></i> Rimuove Effetti di Stato:</span>
                    <span style="padding-left: 15px; font-style: italic;">${removesEffects.join(', ')}</span>
                </div>
            `;
        }
        
        // Active Effects (Bonuses)
        const activeEffects = this.effects ? this.effects.filter(effect => effect.system.applySelf).map(effect => effect.name) : [];
        if (activeEffects.length > 0) {
            propertiesHtml += `
                <div style="display: flex; flex-direction: column; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-weight: bold; color: #ffeb3b;"><i class="fas fa-magic"></i> Effetti Attivi (Modificatori):</span>
                    <span style="padding-left: 15px; font-style: italic;">${activeEffects.join(', ')}</span>
                </div>
            `;
        }
        
        // Special handling for White Honey
        if (name.includes('Miele Bianco') || name.includes('White Honey')) {
            propertiesHtml += `
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-weight: bold; color: #ffeb3b;"><i class="fas fa-broom"></i> Effetto Speciale:</span>
                    <span>Azzera tutta la Tossicità corrente</span>
                </div>
            `;
        }

        const dialogHtml = `
            <div style="padding: 10px; font-family: 'Goudy Old Style', serif; font-size: 16px;">
                <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
                    <img src="${img}" style="width: 64px; height: 64px; border: 2px solid var(--w-gold); border-radius: 4px; background: rgba(0,0,0,0.5);" />
                    <div>
                        <h2 style="margin: 0; color: var(--w-gold); font-family: 'Goudy Old Style', serif; border: none; padding: 0;">${name}</h2>
                        <span style="font-style: italic; font-size: 14px; opacity: 0.8;">Vuoi davvero utilizzare questo oggetto?</span>
                    </div>
                </div>
                
                ${description ? `
                <div style="background: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.2); padding: 8px; border-radius: 4px; max-height: 120px; overflow-y: auto; margin-bottom: 15px; font-size: 14px; line-height: 1.3;">
                    ${description}
                </div>
                ` : ''}
                
                <div style="display: flex; flex-direction: column; gap: 8px; background: rgba(0,0,0,0.3); border: 1px solid var(--w-gold); padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                    <h3 style="margin: 0 0 5px 0; border-bottom: 1px solid var(--w-gold); padding-bottom: 2px; color: var(--w-gold); font-family: 'Goudy Old Style', serif; font-size: 16px;">Effetti Garantiti:</h3>
                    ${propertiesHtml ? propertiesHtml : `<div style="text-align: center; font-style: italic; opacity: 0.7;">Nessun effetto meccanico configurato (Uso narrativo)</div>`}
                </div>
            </div>
        `;

        const locTitle = game.i18n.localize('WITCHER.Dialog.ConfirmUse') === 'WITCHER.Dialog.ConfirmUse' ? "Conferma Utilizzo" : game.i18n.localize('WITCHER.Dialog.ConfirmUse');
        const locYes = game.i18n.localize('WITCHER.Button.Yes') === 'WITCHER.Button.Yes' ? "Sì" : game.i18n.localize('WITCHER.Button.Yes');
        const locNo = game.i18n.localize('WITCHER.Button.No') === 'WITCHER.Button.No' ? "No" : game.i18n.localize('WITCHER.Button.No');

        const action = await foundry.applications.api.DialogV2.wait({
            window: { title: locTitle },
            content: dialogHtml,
            buttons: [
                {
                    action: "yes",
                    label: locYes,
                    class: "standard-button gold",
                    default: true
                },
                {
                    action: "no",
                    label: locNo,
                    class: "standard-button red"
                }
            ],
            modal: true
        });
        
        if (action !== "yes") return false;

        let messageInfos = {};
        if (properties.doesHeal) {
            let heal = parseInt(await this.actor.calculateHealValue(properties.heal));
            this.actor?.update({ 'system.derivedStats.hp.value': this.actor.system.derivedStats.hp.value + heal });
            messageInfos.heal = heal;
        }

        if (properties.temporaryHp != '0') {
            if (
                this.actor.addTemporaryHealth(properties.temporaryHp.value, properties.temporaryHp.duration, this.uuid)
            ) {
                messageInfos.temporaryHp = {
                    tempHp: properties.temporaryHp.value,
                    duration: properties.temporaryHp.duration
                };
            }
        }

        this.actor.applyStatus(properties.effects);
        this.actor.removeStatus(this.system.consumeProperties.removesEffects);

        // Special handling for White Honey (Miele Bianco)
        if (this.name.includes('Miele Bianco') || this.name.includes('White Honey')) {
            const effectsToDelete = this.actor.effects.filter(e => e.system.toxicity > 0).map(e => e.id);
            if (effectsToDelete.length > 0) {
                await this.actor.deleteEmbeddedDocuments('ActiveEffect', effectsToDelete);
            }
        }

        applyActiveEffectToActorViaId(this.actor.uuid, this.uuid, 'applySelf');
        this.createConsumeMessage(messageInfos);
        return true;
    },

    async createConsumeMessage(messageInfos) {
        const messageTemplate = 'systems/TheWitcherItaNewSystem/templates/chat/item/consume.hbs';

        let statusEffects = this.system.consumeProperties.effects.map(effect => {
            return {
                name: effect.name,
                statusEffect: CONFIG.WITCHER.statusEffects.find(configEffect => configEffect.id == effect.statusEffect)
            };
        });

        const content = await foundry.applications.handlebars.renderTemplate(messageTemplate, {
            item: this,
            messageInfos,
            statusEffects
        });
        const chatData = {
            content: content,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            ...(typeof CONST.CHAT_MESSAGE_STYLES !== "undefined" ? { style: CONST.CHAT_MESSAGE_STYLES.OTHER } : { type: CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0 })
        };

        ChatMessage.create(chatData);
    }
};
