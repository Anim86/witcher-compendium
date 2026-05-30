const fs = require('fs');
const path = require('path');

const manualiDir = 'E:/AntigravitiProgetti/CompendioTheWitcher/Manuali';

function getAllTxtFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllTxtFiles(fullPath, fileList);
        } else if (fullPath.endsWith('.txt')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const txtFiles = getAllTxtFiles(manualiDir);
let allText = '';
for (const f of txtFiles) {
    allText += fs.readFileSync(f, 'utf8') + '\n\n';
}
allText = allText.replace(/\r\n/g, ' ').replace(/\n/g, ' ');

const queries = [
    "Creare Luogo di Potere",
    "Faro dell'Innaturale",
    "Faro dell’Innaturale",
    "Registro Magico degli Ospiti",
    "Registro Ospiti",
    "Creare Faro dell'Anima",
    "Creare Faro dell’Anima",
    "Rianimare Cadavere",
    "Sintesi di Cadfan",
    "Sogno Blu di Hanmarvyn",
    "Vaso d'Incantesimi",
    "Vaso d’Incantesimi"
];

for (const q of queries) {
    const escaped = q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escaped})\\s*.{0,250}?`, 'gi');
    let match;
    let found = false;
    while ((match = regex.exec(allText)) !== null) {
        found = true;
        const startIndex = match.index;
        const searchArea = allText.substring(startIndex, startIndex + 300);
        console.log(`\nTrovato [${q}]:`);
        console.log(searchArea);
        break; // prendiamo solo il primo match per non floodare la console
    }
    if (!found) {
        console.log(`\nNon trovato: [${q}]`);
    }
}
