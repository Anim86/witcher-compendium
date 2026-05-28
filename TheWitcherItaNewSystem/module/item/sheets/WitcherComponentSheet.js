import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherComponentSheet extends WitcherItemSheet {
    static DEFAULT_OPTIONS = {
        position: {
            width: 600
        }
    };
    static PARTS = {
        main: {
            template: `systems/TheWitcherItaNewSystem/templates/sheets/item/component-sheet.hbs`,
            scrollable: ['']
        }
    };

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const rarity = this.document.system.rarity || "";
        let normalizedRarity = "Everywhere";

        const r = rarity.toString().trim().toLowerCase();
        if (r === "s" || r === "scarsa" || r === "poor") {
            normalizedRarity = "Poor";
        } else if (r === "c" || r === "comune" || r === "common") {
            normalizedRarity = "Common";
        } else if (r === "r" || r === "rara" || r === "rare") {
            normalizedRarity = "Rare";
        } else if (r === "d" || r === "e" || r === "ovunque" || r === "everywhere") {
            normalizedRarity = "Everywhere";
        }

        context.normalizedRarity = normalizedRarity;
        return context;
    }
}
