const fields = foundry.data.fields;

export default function magicTraining() {
    return {
        isLearned: new fields.BooleanField({ initial: false }),
        isTraining: new fields.BooleanField({ initial: false }),
        successesAccumulated: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        daysSpent: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
        ipPaid: new fields.BooleanField({ initial: false })
    };
}
