const fields = foundry.data.fields;

export default function perk() {
    return {
        name: new fields.StringField({ initial: '' }),
        description: new fields.HTMLField({ initial: '' }),
        modifiers: new fields.ArrayField(new fields.SchemaField({
            target: new fields.StringField({ initial: '' }),
            value: new fields.NumberField({ initial: 0 })
        }), { initial: [] })
    };
}
