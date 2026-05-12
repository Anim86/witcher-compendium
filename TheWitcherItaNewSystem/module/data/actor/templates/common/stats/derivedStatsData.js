import stat from './statData.js';

const fields = foundry.data.fields;

export default class DerivedStats extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            hp: new fields.SchemaField(stat('WITCHER.Actor.DerStat.HP')),
            shield: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Shield')),
            sta: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Sta')),
            resolve: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Resolve')),
            focus: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Focus')),
            vigor: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Vigor')),

            stun: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Stun')),
            run: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Run')),
            leap: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Leap')),
            enc: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Enc')),
            rec: new fields.SchemaField(stat('WITCHER.Actor.DerStat.Rec')),
            woundTreshold: new fields.SchemaField(stat('WITCHER.Actor.DerStat.woundTreshold'))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        const stats = ["stun", "run", "leap", "enc", "woundTreshold", "vigor"];
        for (const s of stats) {
            if (source[s] && (source[s].unmodifiedMax === undefined || source[s].unmodifiedMax === null || source[s].unmodifiedMax === 0)) {
                if (source[s].max > 0) {
                    source[s].unmodifiedMax = source[s].max;
                }
            }
        }

        return super.migrateData(source);
    }
}
