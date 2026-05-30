const fs = require('fs');
const path = require('path');

const spellsDir = 'E:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/MAGIA/witcher-spells';
const manualiDir = 'E:/AntigravitiProgetti/CompendioTheWitcher/Manuali';
const reportPath = 'E:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_incantesimi.md';

// 1. Raccogliere tutti i file di testo dei manuali
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

// Rimuovi newline strani per facilitare la ricerca
allText = allText.replace(/\r\n/g, ' ').replace(/\n/g, ' ');

// 2. Raccogliere gli incantesimi dai JSON
const spellFiles = fs.readdirSync(spellsDir).filter(f => f.endsWith('.json'));
const spells = [];

for (const file of spellFiles) {
    const fullPath = path.join(spellsDir, file);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    
    let stamina = data.system?.stamina !== undefined ? data.system.stamina : 'N/A';
    if (data.system?.staminaIsVar) stamina += ' (Var)';
    
    const source = data.system?.source || '-';
    const level = data.system?.level || '-';
    const relPath = `_tools/src-packs/MAGIA/witcher-spells/${file}`;
    
    spells.push({
        name: data.name,
        cleanName: data.name.replace(/Incantesimo Necromante:\s*/, '').replace(/\s*\(Incantesimo Necromante\)/, '').trim(),
        stamina: stamina,
        source: source,
        level: level,
        path: relPath,
        extractedStamina: 'Non trovato'
    });
}

// 3. Estrarre la stamina dal testo per ogni incantesimo
for (const spell of spells) {
    // Regex per trovare il nome dell'incantesimo seguito dal costo.
    // L'espressione permette spazi multipli.
    const nameRegexStr = spell.cleanName.split(' ').map(word => word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('\\s+');
    
    // Cerca: NomeIncantesimo ... Costo (in)? (RES|STA|Vigore): [numero]
    // Guardiamo fino a 150 caratteri in avanti
    const regex = new RegExp(`(${nameRegexStr})\\s*.{0,150}?Costo(?:\\s+in)?\\s*(?:RES|STA|Vigore|Resistenza)\\s*:\\s*(\\d+|Var|Variabile|[\\d\\w\\s]+?)(?=\\s|Effetto|Gittata|Durata|Danno)`, 'i');
    
    const match = allText.match(regex);
    if (match) {
        spell.extractedStamina = match[2].trim();
    } else {
        // Tentativo secondario per formattazioni diverse, ad es: "Costo: X RES"
        const regex2 = new RegExp(`(${nameRegexStr})\\s*.{0,150}?Costo\\s*:\\s*(\\d+|Var|Variabile)\\s*(?:RES|STA|Vigore)`, 'i');
        const match2 = allText.match(regex2);
        if (match2) {
            spell.extractedStamina = match2[2].trim();
        }
    }
}

// 4. Generare il report
spells.sort((a, b) => a.name.localeCompare(b.name));

let md = '# Report Incantesimi (Spells)\n\n';
md += '| Nome | Costo Attuale (JSON) | Nuovo Costo (Manuale) | Elemento | Livello | Percorso JSON |\n';
md += '|---|---|---|---|---|---|\n';

for (const spell of spells) {
    let extracted = spell.extractedStamina;
    if (extracted !== 'Non trovato') {
        extracted = `**${extracted}**`; // Evidenzia in grassetto se trovato
    }
    md += `| ${spell.name} | ${spell.stamina} | ${extracted} | ${spell.source} | ${spell.level} | \`${spell.path}\` |\n`;
}

fs.writeFileSync(reportPath, md, 'utf8');
console.log('Report estratto e aggiornato con successo in:', reportPath);

