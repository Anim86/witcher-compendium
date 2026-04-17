import CommonItemData from './commonItemData.js';

const fields = foundry.data.fields;

export default class HomelandData extends CommonItemData {
    static metadata = Object.freeze({
        type: 'homeland'
    });

    static defineSchema() {
        const commonData = super.defineSchema();
        return {
            ...commonData,
            value: new fields.StringField({ initial: '' }),
            otherValue: new fields.StringField({ initial: '' })
        };
    }
}
