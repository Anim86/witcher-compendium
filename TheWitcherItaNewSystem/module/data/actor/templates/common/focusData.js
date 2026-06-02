
const fields = foundry.data.fields;

export default function focus() {
    return {
        name:  new fields.StringField({ initial: ""}),
        value: new fields.NumberField({ initial: 0}),
        superior: new fields.BooleanField({ initial: false }),
    }
  }
