const fs = require('fs');
const path = require('path');

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/REGOLAMENTO_E_NARRATIVA/witcher-lore';

const jsonFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));

for (const file of jsonFiles) {
    const filePath = path.join(srcDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`File: ${file} | Name: "${content.name}" | Normalized: "${content.name.toLowerCase().replace(/[^a-z0-9]/g, '')}"`);
}
