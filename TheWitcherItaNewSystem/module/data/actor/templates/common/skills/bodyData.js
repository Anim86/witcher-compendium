import skill from './skillData.js';

const fields = foundry.data.fields;

export default class Body extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            physique: new fields.SchemaField(skill('WITCHER.skills.physique.label')),
            endurance: new fields.SchemaField(skill('WITCHER.skills.endurance.label'))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        if (source.physique) source.physique.label = "WITCHER.skills.physique.label";
        if (source.endurance) source.endurance.label = 'WITCHER.skills.endurance.label';

        return super.migrateData(source);
    }
}
