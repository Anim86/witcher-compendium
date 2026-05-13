import skill from './skillData.js';

const fields = foundry.data.fields;

export default class Reflex extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            brawling: new fields.SchemaField(skill('WITCHER.skills.brawling.label')),
            dodge: new fields.SchemaField(skill('WITCHER.skills.dodgeEscape.label')),
            melee: new fields.SchemaField(skill('WITCHER.skills.melee.label')),
            riding: new fields.SchemaField(skill('WITCHER.skills.riding.label')),
            sailing: new fields.SchemaField(skill('WITCHER.skills.sailing.label')),
            smallblades: new fields.SchemaField(skill('WITCHER.skills.smallblades.label')),
            staffspear: new fields.SchemaField(skill('WITCHER.skills.staffspear.label')),
            swordsmanship: new fields.SchemaField(skill('WITCHER.skills.swordsmanship.label'))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        if (source.brawling) source.brawling.label = 'WITCHER.skills.brawling.label';
        if (source.dodge) source.dodge.label = 'WITCHER.skills.dodgeEscape.label';
        if (source.melee) source.melee.label = 'WITCHER.skills.melee.label';
        if (source.riding) source.riding.label = 'WITCHER.skills.riding.label';
        if (source.sailing) source.sailing.label = 'WITCHER.skills.sailing.label';
        if (source.smallblades) source.smallblades.label = 'WITCHER.skills.smallblades.label';
        if (source.staffspear) source.staffspear.label = 'WITCHER.skills.staffspear.label';
        if (source.swordsmanship) source.swordsmanship.label = 'WITCHER.skills.swordsmanship.label';

        return super.migrateData(source);
    }
}
