const fs = require('fs');
const path = require('path');

const workListPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json';
const schematicsDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics/';

const workList = JSON.parse(fs.readFileSync(workListPath, 'utf8'));
const files = fs.readdirSync(schematicsDir).filter(f => f.endsWith('.json'));

const existingNames = new Set(workList['witcher-schematics'].map(i => i.name));
const newItems = [];

files.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(schematicsDir, file), 'utf8'));
    const name = content.name;
    
    if (!existingNames.has(name)) {
        const filename = name.toLowerCase().replace(/[:']/g, '').replace(/\s+/g, '_') + '.webp';
        newItems.push({
            name: name,
            imgPath: `assets/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics/${filename}`,
            filename: filename
        });
        existingNames.add(name);
    }
});

console.log(`Adding ${newItems.length} new items to witcher-schematics.`);
workList['witcher-schematics'].push(...newItems);

// Sort them by name
workList['witcher-schematics'].sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(workListPath, JSON.stringify(workList, null, 2), 'utf8');
console.log('work_list.json updated.');
