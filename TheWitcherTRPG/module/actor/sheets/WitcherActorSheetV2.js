import WitcherActorSheetV1 from './WitcherActorSheetV1.js';

/**
 * WitcherActorSheetV2 (Fork Leggero)
 * Adds Drag & Drop support for the Witcher RPG system.
 */
export default class WitcherActorSheetV2 extends WitcherActorSheetV1 {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            dragDrop: [{ 
                dragSelector: ".item", 
                dropSelector: ".inventory, .spells, .items, .actor-sheet, .sheet-body" 
            }]
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        
        // Ensure DragDrop is initialized if not handled by defaultOptions (V1 compatibility)
        if (!this._dragDrop || this._dragDrop.length === 0) {
            this._dragDrop = [new DragDrop({
                dragSelector: ".item",
                dropSelector: ".inventory, .spells, .items, .actor-sheet",
                permissions: { drop: this._canDragDrop.bind(this) },
                callbacks: { drop: this._onDrop.bind(this) }
            })];
            this._dragDrop.forEach(d => d.bind(html[0] || html));
        }
    }

    /** @override */
    async _onDrop(event) {
        const data = TextEditor.getDragEventData(event);
        if (data.type !== "Item") return super._onDrop(event);

        const item = await Item.fromDropData(data);
        const itemData = item.toObject();

        // Handle unique item types (only one allowed)
        if (this.uniqueTypes.includes(itemData.type)) {
            const hasExisting = this.actor.items.find(i => i.type === itemData.type);
            if (hasExisting) {
                return ui.notifications.warn(`L'attore ha già un oggetto di tipo ${itemData.type}.`);
            }
        }

        // Create the item on the actor
        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }
}
