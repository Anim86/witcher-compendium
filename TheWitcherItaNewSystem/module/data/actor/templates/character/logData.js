import ipLog from './ipLogData.js';
import currencyLog from './currencyLogData.js';

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

    addCurrencyReward(label, amount) {
        this.currencyLog.push({ label: label, amount: amount, date: Date.now() });
        this.parent.parent.update({
            'system.logs.currencyLog': this.currencyLog
        });
    }

    removeCurrencyLog(index) {
        this.currencyLog.splice(index, 1);
        this.parent.parent.update({
            'system.logs.currencyLog': this.currencyLog
        });
    }
}
