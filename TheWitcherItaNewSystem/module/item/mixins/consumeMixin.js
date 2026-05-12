import { applyActiveEffectToActorViaId } from '../../scripts/temporaryEffects/applyActiveEffect.js';

export let consumeMixin = {
    async consume() {
        let properties = this.system.consumeProperties;
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
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        };

        ChatMessage.create(chatData);
    }
};
