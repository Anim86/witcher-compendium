const fs = require('fs');
const path = require('path');

const SCHEMATIC_PACKS = [
    'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics',
    'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics-racconti',
    'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-dlc-sw-schematics',
    'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-dlc-sl-schematics',
    'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-dlc-ts-schematics'
];

console.log('Renaming schemas to avoid duplicates...');

SCHEMATIC_PACKS.forEach(packPath => {
    if (!fs.existsSync(packPath)) return;
    
    fs.readdirSync(packPath).forEach(file => {
        if (!file.endsWith('.json')) return;
        
        const filePath = path.join(packPath, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (data.name && !data.name.startsWith('Schema: ')) {
            const oldName = data.name;
            data.name = 'Schema: ' + oldName;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
            console.log(`Renamed: "${oldName}" -> "${data.name}" in ${file}`);
        }
    });
});

console.log('Done.');
