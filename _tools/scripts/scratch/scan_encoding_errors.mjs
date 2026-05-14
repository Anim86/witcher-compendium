import fs from 'fs';
import path from 'path';

const srcPacksDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.json')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcPacksDir);
const brokenChars = /Ã[ ¨©¬²¹]/; // Common encoding issues for à, è, é, ì, ò, ù

let report = '# Report Errori di Codifica (Accenti)\n\n';
report += '| File | Parola Errata | Suggerimento |\n';
report += '| :--- | :--- | :--- |\n';

const encodingMap = {
    'Ã ': 'à',
    'Ã¨': 'è',
    'Ã©': 'é',
    'Ã¬': 'ì',
    'Ã²': 'ò',
    'Ã¹': 'ù'
};

let count = 0;

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (brokenChars.test(content)) {
        const relativePath = path.relative('e:/AntigravitiProgetti/CompendioTheWitcher', file);
        
        // Find specific words
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            const matches = line.match(/[^\s"{}[\],]*Ã[ ¨©¬²¹][^\s"{}[\],]*/g);
            if (matches) {
                matches.forEach(match => {
                    let fixed = match;
                    for (const [broken, correct] of Object.entries(encodingMap)) {
                        fixed = fixed.split(broken).join(correct);
                    }
                    report += `| \`${relativePath}\` | \`${match}\` | \`${fixed}\` |\n`;
                    count++;
                });
            }
        });
    }
}

const outputPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/ERRORI_CODIFICA_ACCENTI.md';
fs.writeFileSync(outputPath, report, 'utf8');
console.log(`Found ${count} issues. Report written to ${outputPath}`);
