import ipLog from './ipLogData.js';

const fields = foundry.data.fields;

export default class Log extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            ipLog: new fields.ArrayField(new fields.SchemaField(ipLog()))
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
}
