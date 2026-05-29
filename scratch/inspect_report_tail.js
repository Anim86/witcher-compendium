const fs = require('fs');
const path = require('path');

const mdFile = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_lore_compendio.md';

try {
    const content = fs.readFileSync(mdFile, 'utf8');
    const lines = content.split('\n');
    console.log("Total lines:", lines.length);
    console.log("Tail lines (last 100):");
    console.log(lines.slice(-100).join('\n'));
} catch (err) {
    console.error(err);
}
