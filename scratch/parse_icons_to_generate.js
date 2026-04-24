const fs = require('fs');
const path = require('path');

const reportPath = 'e:\\AntigravitiProgetti\\CompendioTheWitcher\\report-da-generare.md';
const content = fs.readFileSync(reportPath, 'utf8');

const packs = {};
let currentPack = null;

const lines = content.split('\n');
lines.forEach(line => {
    const packMatch = line.match(/^## PACK: ([\w-]+)/);
    if (packMatch) {
        currentPack = packMatch[1];
        packs[currentPack] = [];
        return;
    }

    if (currentPack && line.startsWith('|') && !line.includes('Nome voce') && !line.includes('---')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
            const name = parts[1];
            const imgPath = parts[2];
            const filename = path.basename(imgPath);
            
            // Avoid duplicates
            if (!packs[currentPack].find(item => item.filename === filename)) {
                packs[currentPack].push({
                    name,
                    imgPath,
                    filename
                });
            }
        }
    }
});

const outputPath = 'e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\work_list.json';
fs.writeFileSync(outputPath, JSON.stringify(packs, null, 2));
console.log(`Work list generated: ${outputPath}`);
console.log('Packs found:', Object.keys(packs).length);
for (const pack in packs) {
    console.log(`- ${pack}: ${packs[pack].length} unique icons`);
}
