import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherRitualSheet extends WitcherItemSheet {
    static DEFAULT_OPTIONS = {
        position: {
            width: 900,
            height: 620
        }
    };

    static PARTS = {
        main: {
            template: `systems/TheWitcherItaNewSystem/templates/sheets/item/ritual-sheet.hbs`,
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
            levelSpell: {
                novice: 'WITCHER.Spell.Novice',
                journeyman: 'WITCHER.Spell.Journeyman',
                master: 'WITCHER.Spell.Master'
            },
            targetMode: {
                self: 'WITCHER.Spell.TargetMode.self',
                none: 'WITCHER.Spell.TargetMode.none',
                direct: 'WITCHER.Spell.TargetMode.direct',
                area: 'WITCHER.Spell.TargetMode.area',
                targetStat: 'WITCHER.Spell.TargetMode.targetStat',
                fixedDc: 'WITCHER.Spell.TargetMode.fixedDc',
                gmDc: 'WITCHER.Spell.TargetMode.gmDc',
                manual: 'WITCHER.Spell.TargetMode.manual'
            },
            targetStat: {
                int: 'WITCHER.Actor.Stat.Int',
                ref: 'WITCHER.Actor.Stat.Ref',
                dex: 'WITCHER.Actor.Stat.Dex',
                body: 'WITCHER.Actor.Stat.Body',
                spd: 'WITCHER.Actor.Stat.Spd',
                emp: 'WITCHER.Actor.Stat.Emp',
                cra: 'WITCHER.Actor.Stat.Cra',
                will: 'WITCHER.Actor.Stat.Will',
                luck: 'WITCHER.Actor.Stat.Luck'
            },
            areaShape: {
                circle: 'WITCHER.Spell.Circle',
                cone: 'WITCHER.Spell.Cone',
                line: 'WITCHER.Spell.Line',
                ray: 'WITCHER.Spell.Ray',
                rect: 'WITCHER.Spell.Square',
                sphere: 'WITCHER.Spell.Sphere',
                manual: 'WITCHER.Spell.Manual'
            },
            templateType: {
                rect: 'WITCHER.Spell.Square',
                circle: 'WITCHER.Spell.Circle',
                cone: 'WITCHER.Spell.Cone',
                ray: 'WITCHER.Spell.Ray'
            }
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        let jquery = $(html);
        jquery.find('.edit-component').on('blur', this._onEditComponent.bind(this));
        jquery.find('.remove-component').on('click', this._onRemoveComponent.bind(this));
    }

    async _onDropItem(event, item) {
        if (item) {
            if (event.target.closest('.alternateComponents')) {
                let newComponentList = this.item.system.alternateRitualComponentUuids ?? [];
                newComponentList.push({ uuid: item.uuid, quantity: 1 });
                this.item.update({ 'system.alternateRitualComponentUuids': newComponentList });
            } else {
                let newComponentList = this.item.system.ritualComponentUuids ?? [];
                newComponentList.push({ uuid: item.uuid, quantity: 1 });
                this.item.update({ 'system.ritualComponentUuids': newComponentList });
            }
        }
    }

    _onEditComponent(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.uuid;
        let targetField = element.closest('.list-item').dataset.target;

        let field = element.dataset.field;
        let value = element.value;

        let components = this.item.system[targetField];
        let objIndex = components.findIndex(obj => obj.uuid == itemId);
        components[objIndex][field] = value;
        this.item.update({ [`system.${targetField}`]: components });
    }

    _onRemoveComponent(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest('.list-item').dataset.uuid;
        let targetField = element.closest('.list-item').dataset.target;
        let newComponentList = this.item.system[targetField].filter(item => item.uuid !== itemId);
        this.item.update({ [`system.${targetField}`]: newComponentList });
    }
}
