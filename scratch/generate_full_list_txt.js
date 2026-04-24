const fs = require('fs');
const path = require('path');

const reportPath = 'e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\global_missing_icons_report.json';
const outputPath = 'e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\FULL_MISSING_ICONS_LIST.txt';

const missing = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

let content = "ELENCO COMPLETO VOCI SENZA ICONA (AUDIT GLOBALE)\n";
content += "================================================\n\n";

missing.forEach((m, i) => {
    content += `${(i + 1).toString().padStart(4, ' ')}. [${m.pack}] ${m.name}\n`;
    if (m.expected) content += `      Percorso atteso: ${m.expected}\n`;
    content += "\n";
});

fs.writeFileSync(outputPath, content);
console.log(`Full list saved to ${outputPath}`);
