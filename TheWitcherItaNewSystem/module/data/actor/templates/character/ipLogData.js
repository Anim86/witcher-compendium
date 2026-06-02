const fields = foundry.data.fields;

export default function ipLog() {
    return {
        label: new fields.StringField({ initial: '' }),
        ip: new fields.NumberField({ initial: 0 }),
        isMagic: new fields.BooleanField({ initial: false }),
        isImprovement: new fields.BooleanField({ initial: false }),
        targetType: new fields.StringField({ initial: '' }),
        targetKey: new fields.StringField({ initial: '' }),
        levelsRaised: new fields.NumberField({ initial: 0 }),
        path: new fields.StringField({ initial: '' }),
        index: new fields.StringField({ initial: '' })
    };
}
