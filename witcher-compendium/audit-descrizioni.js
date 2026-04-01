const fs = require('fs');
const path = require('path');

const PACKS_DIR = 'witcher-compendium/packs';

function auditDescriptions() {
    const packs = fs.readdirSync(PACKS_DIR).filter(f => f.endsWith('.db'));
    const auditReport = {
        totalEntries: 0,
        emptyDescriptions: 0,
        details: {}
    };

    packs.forEach(pack => {
        const filePath = path.join(PACKS_DIR, pack);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim());
        
        auditReport.details[pack] = {
            total: lines.length,
            empty: 0,
            missingList: []
        };
        auditReport.totalEntries += lines.length;

        lines.forEach(line => {
            const entry = JSON.parse(line);
            const desc = entry.system?.description;
            if (!desc || desc.trim() === '' || desc === '<p></p>') {
                auditReport.emptyDescriptions++;
                auditReport.details[pack].empty++;
                auditReport.details[pack].missingList.push(entry.name);
            }
        });
    });

    console.log('--- AUDIT DESCRIZIONI ---');
    console.log(`Total Entries: ${auditReport.totalEntries}`);
    console.log(`Empty Descriptions: ${auditReport.emptyDescriptions}`);
    console.log('-------------------------');
    
    for (const [pack, stats] of Object.entries(auditReport.details)) {
        if (stats.empty > 0) {
            console.log(`${pack}: ${stats.empty} / ${stats.total} empty`);
        }
    }

    fs.writeFileSync('audit-descrizioni-results.json', JSON.stringify(auditReport, null, 2));
}

auditDescriptions();
