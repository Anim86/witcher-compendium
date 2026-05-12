const fs = require('fs');
const path = require('path');

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy/';
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));

const items = {};

files.forEach(file => {
    try {
        const content = JSON.parse(fs.readFileSync(path.join(srcDir, file), 'utf8'));
        const name = content.name;
        if (!items[name]) items[name] = [];
        
        const desc = content.system.description || '';
        const isTable = desc.includes('UnitÃ ') || /^[A-Z] [A-Za-z ]+ \d/.test(desc.replace('<p>', '').substring(0, 20));
        
        items[name].push({
            file: file,
            desc: desc.length > 50 ? desc.substring(0, 50) + '...' : desc,
            length: desc.length,
            isTable: isTable
        });
    } catch (e) {}
});

const duplicates = {};
for (const name in items) {
    if (items[name].length > 1) {
        duplicates[name] = items[name];
    }
}

console.log(JSON.stringify(duplicates, null, 2));
