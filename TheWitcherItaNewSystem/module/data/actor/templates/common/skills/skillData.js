import modifier from '../modifierData.js';

const fields = foundry.data.fields;

export default function skill(label, mult = 1, isMagic = false) {
    return {
        value: new fields.NumberField({ initial: 0 }),
        label: new fields.StringField({ initial: label }),
        isOpened: new fields.BooleanField({ initial: false }),
        isVisible: new fields.BooleanField({ initial: false, label: label }),
        isMagic: new fields.BooleanField({ initial: isMagic }),
        modifiers: new fields.ArrayField(new fields.SchemaField(modifier())),
        activeEffectModifiers: new fields.NumberField({ initial: 0 }),
        multiplier: new fields.NumberField({ initial: mult, min: 1, max: 2 }),
        isProfession: new fields.BooleanField({ initial: false }),
        isPickup: new fields.BooleanField({ initial: false }),
        isLearned: new fields.BooleanField({ initial: false }),
        isCombatSkill: new fields.BooleanField({ initial: false })
    };
}
