const fs = require('fs');
const path = require('path');

const manualiDir = 'E:/AntigravitiProgetti/CompendioTheWitcher/Manuali/the-witcher-tomo-del-caos_Estrazione/Testi';

const files = fs.readdirSync(manualiDir);
let allText = '';
for (const file of files) {
    if (file.endsWith('.txt')) {
        allText += fs.readFileSync(path.join(manualiDir, file), 'utf8') + ' ';
    }
}
allText = allText.replace(/\r\n/g, ' ').replace(/\n/g, ' ');

const queries = [
    "Faro dell[’']Innaturale",
    "Registro Magico degli Ospiti",
    "Sogno Blu di Hanmarvyn"
];

for (const q of queries) {
    const regex = new RegExp(`(${q})\\s*.{0,250}?Costo.*?\\s*(\\d+|Var)`, 'gi');
    let match;
    while ((match = regex.exec(allText)) !== null) {
        console.log(`\nTrovato [${q}]:`);
        console.log(match[0]);
    }
}
