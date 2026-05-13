import skill from './skillData.js';

const fields = foundry.data.fields;

export default class Will extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            courage: new fields.SchemaField(skill('WITCHER.skills.courage.label')),
            hexweave: new fields.SchemaField(skill('WITCHER.skills.hexWeaving.label', 2)),
            intimidation: new fields.SchemaField(skill('WITCHER.skills.intimidation.label')),
            spellcast: new fields.SchemaField(skill('WITCHER.skills.spellCasting.label', 2)),
            resistmagic: new fields.SchemaField(skill('WITCHER.skills.resistMagic.label')),
            resistcoerc: new fields.SchemaField(skill('WITCHER.skills.resistCoercion.label')),
            ritcraft: new fields.SchemaField(skill('WITCHER.skills.ritualCrafting.label', 2))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        if (source.courage) source.courage.label = 'WITCHER.skills.courage.label';
        if (source.hexweave) source.hexweave.label = 'WITCHER.skills.hexWeaving.label';
        if (source.intimidation) source.intimidation.label = 'WITCHER.skills.intimidation.label';
        if (source.spellcast) source.spellcast.label = 'WITCHER.skills.spellCasting.label';
        if (source.resistmagic) source.resistmagic.label = 'WITCHER.skills.resistMagic.label';
        if (source.resistcoerc) source.resistcoerc.label = 'WITCHER.skills.resistCoercion.label';
        if (source.ritcraft) source.ritcraft.label = 'WITCHER.skills.ritualCrafting.label';

        return super.migrateData(source);
    }
}
