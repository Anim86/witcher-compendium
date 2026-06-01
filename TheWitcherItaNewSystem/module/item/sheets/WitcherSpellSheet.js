
import WitcherSpellConfigurationSheet from "./configurations/WitcherSpellConfigurationSheet.js";
import WitcherItemSheet from './WitcherItemSheet.js';

export default class WitcherSpellSheet extends WitcherItemSheet {
    static DEFAULT_OPTIONS = {
        position: {
            width: 900,
            height: 620
        }
    };

    configuration = new WitcherSpellConfigurationSheet({ document: this.item });

    static PARTS = {
        main: {
            template: `systems/TheWitcherItaNewSystem/templates/sheets/item/spell-sheet.hbs`,
            scrollable: ['']
        }
    };

    get title() {
        const classLabel = this._getMagicClassTitleLabel(this.item.system.class);
        return `${classLabel}: ${this.item.name}`;
    }

    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.selects = this.createSelects();

        return context;
    }

    createSelects() {
        return {
            class: {
                Spells: 'WITCHER.Spell.Spells',
                Invocations: 'WITCHER.Spell.Invocations',
                Witcher: 'WITCHER.Spell.WitcherShort',
                MagicalGift: 'WITCHER.Spell.MagicalGift'
            },
            levelSpell: {
                novice: 'WITCHER.Spell.Novice',
                journeyman: 'WITCHER.Spell.Journeyman',
                master: 'WITCHER.Spell.Master'
            },
            levelMagicalGift: {
                'minor gift': 'WITCHER.Spell.MinorGift',
                'major gift': 'WITCHER.Spell.MajorGift'
            },
            sourceElements: {
                water: 'WITCHER.Spell.Water',
                air: 'WITCHER.Spell.Air',
                earth: 'WITCHER.Spell.Earth',
                fire: 'WITCHER.Spell.Fire',
                mixed: 'WITCHER.Spell.Mixed'
            },
            sourceClass: {
                'druid': 'WITCHER.Spell.Druid',
                'preacher': 'WITCHER.Spell.Preacher',
                'arch priest': 'WITCHER.Spell.Archpriest'
            },
            domain: {
                basic: 'WITCHER.Spell.Basic',
                alternate: 'WITCHER.Spell.Alt'
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

    _getMagicClassTitleLabel(magicClass) {
        const labels = {
            Spells: 'WITCHER.Spell.Spell',
            Invocations: 'WITCHER.Spell.Invocation',
            Witcher: 'WITCHER.Spell.WitcherSign',
            MagicalGift: 'WITCHER.Spell.MagicalGift'
        };

        return game.i18n.localize(labels[magicClass] ?? 'WITCHER.Item.Type.spell');
    }
}
