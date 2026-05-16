const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;
import Rewards from '/systems/TheWitcherItaNewSystem/module/app/reward/reward.js';

export default class RewardsSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        window: {
            resizable: true
        },
        position: {
            width: 520,
            height: 480
        },
        classes: ['witcher', 'extended-sheet', 'actor', 'witcher-rewards-window'],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            addIpReward: function() { return this.document.addIpReward(); },
            giveReward: function(event, target) {
                const type = target.dataset.type || 'standard';
                return Rewards.handoutIpRewards([this.document], type);
            },
            deleteIpLog: function(event, target) { 
                const index = target.dataset.index;
                return this.document.system.logs.removeIpLog(index);
            }
        }
    };

    static PARTS = {
        header: {
            template: `systems/TheWitcherItaNewSystem/templates/sheets/actor/rewards/header.hbs`
        },
        ip: {
            template: `systems/TheWitcherItaNewSystem/templates/sheets/actor/rewards/ip.hbs`,
            scrollable: ['.ip-logs']
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.config = CONFIG.WITCHER;
        context.system = this.document.system;
        context.isGM = game.user.isGM;

        return context;
    }
}
