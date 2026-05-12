const fs = require('fs');
const path = require('path');

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy/';

// Re-run the identification logic to be sure
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));

const items = {};

// Re-run the identification logic to be sure
files.forEach(file => {
    try {
        const content = JSON.parse(fs.readFileSync(path.join(srcDir, file), 'utf8'));
        const name = content.name;
        if (!items[name]) items[name] = [];
        
        const desc = content.system.description || '';
        // Criteria for "Table" style: contains 'UnitÃ ' (corrupted encoding of Unità) or starts with rarity code
        const isTable = desc.includes('UnitÃ ') || desc.includes('Unità') || /^[A-Z] [A-Za-z ]+ \d/.test(desc.replace('<p>', '').substring(0, 20));
        
        items[name].push({
            file: file,
            length: desc.length,
            isTable: isTable
        });
    } catch (e) {}
});

console.log('Remediation Started...');

for (const name in items) {
    const versions = items[name];
    if (versions.length > 1) {
        // Find the 'Table' versions to delete
        const toDelete = versions.filter(v => v.isTable);
        const toKeep = versions.filter(v => !v.isTable);
        
        // Safety check: if all are tables or all are narrative, keep the longest one
        if (toKeep.length === 0) {
            versions.sort((a, b) => b.length - a.length);
            const keep = versions.shift();
            versions.forEach(v => {
                console.log(`Deleting redundant table version: ${v.file}`);
                fs.unlinkSync(path.join(srcDir, v.file));
            });
        } else {
            toDelete.forEach(v => {
                console.log(`Deleting table version: ${v.file}`);
                fs.unlinkSync(path.join(srcDir, v.file));
            });
            // If more than one narrative version remains, keep the longest
            if (toKeep.length > 1) {
                toKeep.sort((a, b) => b.length - a.length);
                const keep = toKeep.shift();
                toKeep.forEach(v => {
                    console.log(`Deleting shorter narrative duplicate: ${v.file}`);
                    fs.unlinkSync(path.join(srcDir, v.file));
                });
            }
        }
    }
}

// Special case: Grave Hag Tongue bestiary dump
const graveHagBad = 'Lingua_di_Strega_dei_Sepolcri_04944ab27aff4ea5.json';
if (fs.existsSync(path.join(srcDir, graveHagBad))) {
    console.log(`Deleting Grave Hag bestiary dump: ${graveHagBad}`);
    fs.unlinkSync(path.join(srcDir, graveHagBad));
}

console.log('Remediation Complete.');
