const fs = require('fs');
const path = require('path');

const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/global_missing_icons_report.json';
const missing = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

let content = 'ELENCO COMPLETO ICONE MANCANTI - WITCHER COMPENDIUM\n';
content += '====================================================\n\n';

const groups = {};
missing.forEach(m => {
    groups[m.pack] = (groups[m.pack] || []);
    groups[m.pack].push(m);
});

for (const pack in groups) {
    content += `PACK: ${pack} (${groups[pack].length} mancanti)\n`;
    content += '----------------------------------------------------\n';
    groups[pack].sort((a,b) => a.name.localeCompare(b.name)).forEach(item => {
        content += `- ${item.name} (File previsto: ${path.basename(item.expected)})\n`;
    });
    content += '\n';
}

const outputPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/FULL_MISSING_ICONS_LIST.txt';
fs.writeFileSync(outputPath, content);
console.log(`Updated FULL_MISSING_ICONS_LIST.txt at: ${outputPath}`);
