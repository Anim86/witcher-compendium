import stat from './statData.js';

const fields = foundry.data.fields;

export default class Stats extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            int: new fields.SchemaField(stat('WITCHER.Actor.Stat.Int')),
            ref: new fields.SchemaField(stat('WITCHER.Actor.Stat.Ref')),
            dex: new fields.SchemaField(stat('WITCHER.Actor.Stat.Dex')),
            body: new fields.SchemaField(stat('WITCHER.Actor.Stat.Body')),
            spd: new fields.SchemaField(stat('WITCHER.Actor.Stat.Spd')),
            emp: new fields.SchemaField(stat('WITCHER.Actor.Stat.Emp')),
            cra: new fields.SchemaField(stat('WITCHER.Actor.Stat.Cra')),
            will: new fields.SchemaField(stat('WITCHER.Actor.Stat.Will')),
            luck: new fields.SchemaField(stat('WITCHER.Actor.Stat.Luck')),
            toxicity: new fields.SchemaField(stat('WITCHER.Actor.Stat.Toxicity', 100))
        };
    }

    prepareBaseData() {
        this.int.max = this.int.unmodifiedMax || this.int.max;
        this.ref.max = this.ref.unmodifiedMax || this.ref.max;
        this.dex.max = this.dex.unmodifiedMax || this.dex.max;
        this.body.max = this.body.unmodifiedMax || this.body.max;
        this.spd.max = this.spd.unmodifiedMax || this.spd.max;
        this.emp.max = this.emp.unmodifiedMax || this.emp.max;
        this.cra.max = this.cra.unmodifiedMax || this.cra.max;
        this.will.max = this.will.unmodifiedMax || this.will.max;

        this.toxicity.max = this.toxicity.unmodifiedMax || this.toxicity.max;
        this.luck.max = this.luck.unmodifiedMax || this.luck.max;
    }

    /** @inheritdoc */
    static migrateData(source) {
        const stats = ["int", "ref", "dex", "body", "spd", "emp", "cra", "will", "luck", "toxicity"];
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
