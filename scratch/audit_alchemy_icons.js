const fs = require('fs');
const path = require('path');

const tempDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/temp_images/witcher-alchemy/';
const packDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy/';

const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.png'));
const jsonFiles = fs.readdirSync(packDir).filter(f => f.endsWith('.json'));

const results = {
    found: [],
    missingIcon: [],
    orphanedIcon: []
};

const fileBaseNames = files.map(f => f.replace('.png', ''));

jsonFiles.forEach(jf => {
    const content = JSON.parse(fs.readFileSync(path.join(packDir, jf), 'utf8'));
    const name = content.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    
    // Check if icon exists
    // We try to match by name or by specific filename if we had a mapping
    // But for now, let's just see if a file with a similar name exists
    const match = fileBaseNames.find(f => f === name || name.includes(f) || f.includes(name));
    
    if (match) {
        results.found.push({ json: jf, icon: match + '.png' });
    } else {
        results.missingIcon.push({ json: jf, name: content.name });
    }
});

console.log(`JSON Files: ${jsonFiles.length}`);
console.log(`Icons Found: ${results.found.length}`);
console.log(`Missing Icons: ${results.missingIcon.length}`);

if (results.missingIcon.length > 0) {
    console.log("Missing for:");
    results.missingIcon.forEach(m => console.log(` - ${m.name} (${m.json})`));
}
