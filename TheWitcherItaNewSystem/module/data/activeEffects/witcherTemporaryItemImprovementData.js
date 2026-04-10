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
                mode: new fields.NumberField({ required: true, integer: true }),
                value: new fields.StringField(),
                priority: new fields.NumberField(),
                type: new fields.StringField(),
                phase: new fields.StringField()
            }), { initial: [] })
        };
    }
}
