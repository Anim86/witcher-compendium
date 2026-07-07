const fields = foundry.data.fields;

export default class WitcherTemporaryItemImprovementData extends foundry.abstract.TypeDataModel {
    static metadata = Object.freeze({
        type: 'temporaryItemImprovement'
    });

    static defineSchema() {
        return {
            applySelf: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applySelf'
            }),
            applyOnTarget: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applyOnTarget'
            }),
            isTransferred: new fields.BooleanField({ initial: false }),
            changes: new fields.ArrayField(new fields.SchemaField({
                key: new fields.StringField({ required: true }),
                value: new fields.StringField({ required: true }),
                type: new fields.StringField({ initial: 'add' }),
                priority: new fields.NumberField(),
                phase: new fields.StringField()
            }))
        };
    }
}
