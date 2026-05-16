const fields = foundry.data.fields;

export default function currencyLog() {
    return {
        label: new fields.StringField({ initial: '' }),
        amount: new fields.NumberField({ initial: 0 }),
        date: new fields.NumberField({ initial: Date.now() })
    };
}
