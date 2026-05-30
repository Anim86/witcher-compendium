const fs = require('fs');
const path = require('path');

const manualiDir = 'E:/AntigravitiProgetti/CompendioTheWitcher/Manuali';
const reportPath = 'E:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_incantesimi.md';

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

// Legge il report esistente e aggiorna solo i mancanti specifici che possiamo estrarre più manualmente
let reportContent = fs.readFileSync(reportPath, 'utf8');

const regexes = [
    { nome: "L'Incubo", regex: /L'Incubo\s+Costo(?:[\s]+in)?[\s]*(?:RES|STA|Vigore|Resistenza)[\s]*:[\s]*(\d+|Var|Variabile)/i },
    { nome: "Banchetto dell'Abbondanza", regex: /Banchetto dell'Abbondanza\s*.{0,100}Costo(?:[\s]+in)?[\s]*(?:RES|STA|Vigore|Resistenza)[\s]*:[\s]*(\d+|Var|Variabile)/i },
    { nome: "Benedizione dell'Abbondanza", regex: /Benedizione dell'Abbondanza\s*.{0,100}Costo(?:[\s]+in)?[\s]*(?:RES|STA|Vigore|Resistenza)[\s]*:[\s]*(\d+|Var|Variabile)/i },
    { nome: "Guaritore della Foresta", regex: /Guaritore della Foresta\s*.{0,100}Costo(?:[\s]+in)?[\s]*(?:RES|STA|Vigore|Resistenza)[\s]*:[\s]*(\d+|Var|Variabile)/i }
];

for (const item of regexes) {
    const match = allText.match(item.regex);
    if (match) {
        const cost = match[1];
        console.log(`Trovato manualmente per ${item.nome}: ${cost}`);
        
        // Sostituisci nel report
        // Cerca la riga: | L'Incubo | ... | Non trovato |
        // sfuggiamo al nome
        const escapedName = item.nome.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const reportRowRegex = new RegExp(`(\\|\\s*${escapedName}\\s*\\|[^|]+\\|[^|]+\\|\\s*)Non trovato(\\s*\\|.*\\n)`, 'g');
        reportContent = reportContent.replace(reportRowRegex, `$1**${cost}**$2`);
    } else {
        console.log(`Ancora non trovato per ${item.nome}`);
    }
}

fs.writeFileSync(reportPath, reportContent, 'utf8');
console.log("Report aggiornato con risultati manuali.");

