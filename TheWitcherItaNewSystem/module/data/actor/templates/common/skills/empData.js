import skill from './skillData.js';

const fields = foundry.data.fields;

export default class Empathy extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            charisma: new fields.SchemaField(skill('WITCHER.skills.charisma.label')),
            deceit: new fields.SchemaField(skill('WITCHER.skills.deceit.label')),
            finearts: new fields.SchemaField(skill('WITCHER.skills.fineArts.label')),
            gambling: new fields.SchemaField(skill('WITCHER.skills.gambling.label')),
            grooming: new fields.SchemaField(skill('WITCHER.skills.groomingAndStyle.label')),
            perception: new fields.SchemaField(skill('WITCHER.skills.humanPerception.label')),
            leadership: new fields.SchemaField(skill('WITCHER.skills.leadership.label')),
            persuasion: new fields.SchemaField(skill('WITCHER.skills.persuasion.label')),
            performance: new fields.SchemaField(skill('WITCHER.skills.performance.label')),
            seduction: new fields.SchemaField(skill('WITCHER.skills.seduction.label'))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        if (source.charisma) source.charisma.label = 'WITCHER.skills.charisma.label';
        if (source.deceit) source.deceit.label = 'WITCHER.skills.deceit.label';
        if (source.finearts) source.finearts.label = 'WITCHER.skills.fineArts.label';
        if (source.gambling) source.gambling.label = 'WITCHER.skills.gambling.label';
        if (source.grooming) source.grooming.label = 'WITCHER.skills.groomingAndStyle.label';
        if (source.perception) source.perception.label = 'WITCHER.skills.humanPerception.label';
        if (source.leadership) source.leadership.label = 'WITCHER.skills.leadership.label';
        if (source.persuasion) source.persuasion.label = 'WITCHER.skills.persuasion.label';
        if (source.performance) source.performance.label = 'WITCHER.skills.performance.label';
        if (source.seduction) source.seduction.label = 'WITCHER.skills.seduction.label';

        return super.migrateData(source);
    }
}
