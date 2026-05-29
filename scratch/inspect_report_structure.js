const fs = require('fs');
const mdFile = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_lore_compendio.md';

try {
    const content = fs.readFileSync(mdFile, 'utf8');
    const lines = content.split('\n');
    console.log("Total lines:", lines.length);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes("Accademie e Istituzioni")) {
            console.log(`Line ${i + 1}: "${line}"`);
        }
    }
} catch (err) {
    console.error(err);
}
