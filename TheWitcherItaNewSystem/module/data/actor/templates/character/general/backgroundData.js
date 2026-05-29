const fields = foundry.data.fields;

export default function background() {
    return {
        value: new fields.HTMLField({ initial: '' }),
        socialStatus: new fields.StringField({ initial: '' }),
        familyState: new fields.StringField({ initial: '' }),
        familyFate: new fields.StringField({ initial: '' }),
        parentsState: new fields.StringField({ initial: '' }),
        parentsFate: new fields.StringField({ initial: '' })
    };
}
