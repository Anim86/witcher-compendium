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
            path: filePath,
            descLength: content.system?.description?.value?.length || 0
        });
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});

const toDelete = [];
const kept = [];

Object.keys(itemsByName).forEach(name => {
    const variants = itemsByName[name];
    if (variants.length > 1) {
        // Sort by description length descending
        variants.sort((a, b) => b.descLength - a.descLength);
        
        const canonical = variants[0];
        kept.push(canonical.file);
        
        for (let i = 1; i < variants.length; i++) {
            toDelete.push(variants[i].path);
        }
    }
});

console.log(`Plan to delete ${toDelete.length} duplicate files.`);
toDelete.forEach(p => console.log(`DELETE: ${path.basename(p)}`));

// Uncomment to actually delete
// toDelete.forEach(p => fs.unlinkSync(p));
