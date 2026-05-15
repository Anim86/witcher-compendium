import currencyLog from './currencyLogData.js';
import ipLog from './ipLogData.js';

const fields = foundry.data.fields;

export default class Log extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            ipLog: new fields.ArrayField(new fields.SchemaField(ipLog())),
            currencyLog: new fields.ArrayField(new fields.SchemaField(currencyLog()))
        };
    }

    addIpReward(label, ip, isMagic) {
        this.ipLog.push({ label: label, ip: ip, isMagic: isMagic });
        if (!isMagic) {
            this.parent.parent.update({
                'system.logs.ipLog': this.ipLog,
                'system.improvementPoints': this.parent.improvementPoints + ip
            });
        }

        if (isMagic) {
            this.parent.parent.update({
                'system.logs.ipLog': this.ipLog,
                'system.magic.magicImprovementPoints': this.parent.magic.magicImprovementPoints + ip
            });
        }
    }

    addCurrencyReward(label, amount, type) {
        this.currencyLog.push({ label: label, amount: amount, type: type });
        this.parent.parent.update({
            'system.logs.currencyLog': this.currencyLog,
            [`system.currency.${type}`]: this.parent.currency[type] + amount
        });
    }

    removeIpLog(index) {
        const entry = this.ipLog[index];
        if (!entry) return;
        
        const ip = entry.ip || 0;
        const isMagic = entry.isMagic;
        
        this.ipLog.splice(index, 1);
        
        const updateData = { 'system.logs.ipLog': this.ipLog };
        if (isMagic) {
            updateData['system.magic.magicImprovementPoints'] = Math.max(0, this.parent.magic.magicImprovementPoints - ip);
        } else {
            updateData['system.improvementPoints'] = Math.max(0, this.parent.improvementPoints - ip);
        }
        
        this.parent.parent.update(updateData);
    }

    removeCurrencyLog(index) {
        const entry = this.currencyLog[index];
        if (!entry) return;
        
        const amount = entry.amount || 0;
        const type = entry.type;
        
        this.currencyLog.splice(index, 1);
        
        this.parent.parent.update({
            'system.logs.currencyLog': this.currencyLog,
            [`system.currency.${type}`]: Math.max(0, this.parent.currency[type] - amount)
        });
    }
}
