const fs = require('fs');
const workList = JSON.parse(fs.readFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json', 'utf8'));

const packsToAudit = ['witcher-weapons', 'witcher-equipment'];
const issues = [];

packsToAudit.forEach(packName => {
    const items = workList[packName];
    const seen = new Set();
    
    items.forEach(item => {
        const name = item.name;
        const normalized = name.toLowerCase().trim().replace(/[’']/g, "'");
        
        // 1. Truncation check
        if (name.endsWith('.')) {
            issues.push({ pack: packName, type: 'truncation', name: name });
        }
        
        // 2. Encoding check
        if (name.includes('Ã')) {
            issues.push({ pack: packName, type: 'encoding', name: name });
        }
        
        // 3. Duplicate check (including apostrophe normalization)
        if (seen.has(normalized)) {
            issues.push({ pack: packName, type: 'duplicate', name: name });
        } else {
            seen.add(normalized);
        }
    });
});

console.log(JSON.stringify(issues, null, 2));
