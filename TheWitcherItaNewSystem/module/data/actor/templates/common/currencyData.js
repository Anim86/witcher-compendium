const fields = foundry.data.fields;

export default function currency() {
    return {
        crown: new fields.NumberField({ initial: 0}),
    };
  }