import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherNoteSheet extends WitcherItemSheet {
    static PARTS = {
        main: {
            template: `systems/TheWitcherItaNewSystem/templates/sheets/item/note-sheet.hbs`,
            scrollable: ['']
        }
    };
}
