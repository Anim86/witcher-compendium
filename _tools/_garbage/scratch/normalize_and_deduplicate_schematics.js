const fs = require('fs');
const path = require('path');

const schematicsDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics/';

const files = fs.readdirSync(schematicsDir).filter(f => f.endsWith('.json'));

const itemsByNormalizedName = {};

files.forEach(file => {
    const filePath = path.join(schematicsDir, file);
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        // Normalize name: replace smart apostrophes and quotes
        const normalizedName = content.name.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').trim();
        
        if (!itemsByNormalizedName[normalizedName]) {
            itemsByNormalizedName[normalizedName] = [];
        }
        itemsByNormalizedName[normalizedName].push({
            file: file,
            path: filePath,
            name: content.name,
            descLength: content.system?.description?.value?.length || 0
        });
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});

const toDelete = [];

Object.keys(itemsByNormalizedName).forEach(normName => {
    const variants = itemsByNormalizedName[normName];
    if (variants.length > 1) {
        // Sort by description length descending
        variants.sort((a, b) => b.descLength - a.descLength);
        
        const canonical = variants[0];
        console.log(`Canonical for "${normName}": ${canonical.file} (Original Name: ${canonical.name})`);
        
        for (let i = 1; i < variants.length; i++) {
            console.log(`  - Deleting variant: ${variants[i].file} (Original Name: ${variants[i].name})`);
            toDelete.push(variants[i].path);
        }
    }
});

console.log(`Plan to delete ${toDelete.length} more duplicate files after normalization.`);

// Perform deletion
toDelete.forEach(p => fs.unlinkSync(p));
console.log('Cleanup complete.');
