const fields = foundry.data.fields;

export default class WitcherActiveEffectData extends foundry.abstract.TypeDataModel {
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
            applyOnHit: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applyOnHit'
            }),
            applyOnDamage: new fields.BooleanField({
                initial: false,
                label: 'WITCHER.Effect.applyOnDamage'
            }),
            changes: new fields.ArrayField(new fields.SchemaField({
                key: new fields.StringField({ required: true }),
                value: new fields.StringField({ required: true }),
                mode: new fields.NumberField({ integer: true, initial: 2 }),
                priority: new fields.NumberField(),
                type: new fields.StringField(),
                phase: new fields.StringField()
            }))
        };
    }
}
