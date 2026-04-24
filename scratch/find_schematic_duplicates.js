const fs = require('fs');
const path = require('path');

const schematicsDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics/';

const files = fs.readdirSync(schematicsDir).filter(f => f.endsWith('.json'));

const itemsByName = {};

files.forEach(file => {
    const filePath = path.join(schematicsDir, file);
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const name = content.name;
        if (!itemsByName[name]) {
            itemsByName[name] = [];
        }
        itemsByName[name].push({
            file: file,
            size: fs.statSync(filePath).size,
            descLength: content.system?.description?.length || 0,
            hasRecipe: !!content.system?.recipe,
            hasSource: !!content.system?.source
        });
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});

const duplicates = Object.keys(itemsByName).filter(name => itemsByName[name].length > 1);

console.log(`Found ${duplicates.length} items with duplicates.`);

duplicates.forEach(name => {
    console.log(`\nItem: ${name}`);
    itemsByName[name].forEach(info => {
        console.log(`  - File: ${info.file}, Size: ${info.size}, Desc: ${info.descLength}, Recipe: ${info.hasRecipe}, Source: ${info.hasSource}`);
    });
});
