import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherCriticalWoundSheet extends WitcherItemSheet {
    static PARTS = {
        main: {
            template: `systems/TheWitcherItaNewSystem/templates/sheets/item/criticalWound-sheet.hbs`,
            scrollable: ['.scrollable']
        }
    };
}
