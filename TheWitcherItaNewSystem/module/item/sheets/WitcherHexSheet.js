import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherHexSheet extends WitcherItemSheet {
    static PARTS = {
        main: {
            template: `systems/TheWitcherItaNewSystem/templates/sheets/item/hex-sheet.hbs`,
            scrollable: ['']
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.selects = this.createSelects();

        return context;
    }

    createSelects() {
        return {
            danger: {
                low: 'WITCHER.Spell.DangerLow',
                medium: 'WITCHER.Spell.DangerMedium',
                high: 'WITCHER.Spell.DangerHigh'
            }
        };
    }
}
