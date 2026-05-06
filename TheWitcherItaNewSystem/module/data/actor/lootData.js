import currency from './templates/common/currencyData.js';

const fields = foundry.data.fields;

export default class LootData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            maxWeight: new fields.NumberField({ initial: 0 }),
            description: new fields.StringField({ initial: '' }),
            currency: new fields.SchemaField(currency())
        };
    }

    calcCurrencyWeight() {
        let totalPieces = Number(this.currency.crown);
        return Number(totalPieces * 0.001);
    }
}
