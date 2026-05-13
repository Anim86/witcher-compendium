import skill from './skillData.js';

const fields = foundry.data.fields;

export default class Craft extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            alchemy: new fields.SchemaField(skill('WITCHER.skills.alchemy.label')),
            crafting: new fields.SchemaField(skill('WITCHER.skills.crafting.label')),
            disguise: new fields.SchemaField(skill('WITCHER.skills.disguise.label')),
            firstaid: new fields.SchemaField(skill('WITCHER.skills.firstAid.label')),
            forgery: new fields.SchemaField(skill('WITCHER.skills.forgery.label')),
            picklock: new fields.SchemaField(skill('WITCHER.skills.pickLock.label')),
            trapcraft: new fields.SchemaField(skill('WITCHER.skills.trapCrafting.label'))
        };
    }

    /** @inheritdoc */
    static migrateData(source) {
        if (source.alchemy) source.alchemy.label = 'WITCHER.skills.alchemy.label';
        if (source.crafting) source.crafting.label = 'WITCHER.skills.crafting.label';
        if (source.disguise) source.disguise.label = 'WITCHER.skills.disguise.label';
        if (source.firstaid) source.firstaid.label = 'WITCHER.skills.firstAid.label';
        if (source.forgery) source.forgery.label = 'WITCHER.skills.forgery.label';
        if (source.picklock) source.picklock.label = 'WITCHER.skills.pickLock.label';
        if (source.trapcraft) source.trapcraft.label = 'WITCHER.skills.trapCrafting.label';

        return super.migrateData(source);
    }
}
