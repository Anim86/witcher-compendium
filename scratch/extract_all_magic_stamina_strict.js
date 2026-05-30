const fs = require('fs');
const path = require('path');

const magiaDir = 'E:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/MAGIA';
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

const spells = [];

function parseMagiaDirectory(baseDir) {
    const folders = fs.readdirSync(baseDir);
    for (const folder of folders) {
        const folderPath = path.join(baseDir, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const fullPath = path.join(folderPath, file);
                const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                
                let stamina = data.system?.stamina !== undefined ? data.system.stamina : 'N/A';
                if (data.system?.staminaIsVar) stamina += ' (Var)';
                
                let cleanName = data.name;
                // Special handling for L'Incubo and other tricky names
                cleanName = cleanName.replace(/Incantesimo Necromante:\s*/i, '')
                                     .replace(/\s*\(Incantesimo Necromante\)/i, '')
                                     .replace(/Segno:\s*/i, '')
                                     .replace(/Rituale:\s*/i, '')
                                     .replace(/Fattura:\s*/i, '')
                                     .replace(/L'Incubo/i, "L'Incubo") // ensure correct casing or character
                                     .trim();

                spells.push({
                    name: data.name,
                    cleanName: cleanName,
                    type: folder,
                    stamina: stamina,
                    source: data.system?.source || '-',
                    level: data.system?.level || '-',
                    sourcebook: data.system?.sourcebook || '-',
                    path: `_tools/src-packs/MAGIA/${folder}/${file}`,
                    extractedStamina: 'Non trovato'
                });
            }
        }
    }
}

parseMagiaDirectory(magiaDir);

const allSpellNames = spells.map(s => s.cleanName).sort((a, b) => b.length - a.length);

for (const spell of spells) {
    let bestStamina = 'Non trovato';
    
    // Support partial match or complex characters like apostrophe
    // e.g. "L'Incubo"
    const nameRegexStr = spell.cleanName
                            .split(' ')
                            .map(w => w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
                            .join('\\s+');
                            
    const nameRegex = new RegExp(nameRegexStr, 'gi');
    
    let match;
    while ((match = nameRegex.exec(allText)) !== null) {
        const startIndex = match.index + match[0].length;
        const searchArea = allText.substring(startIndex, startIndex + 350); // increased window size
        
        const costRegexes = [
            /Costo(?:[\s]+in)?[\s]*(?:RES|STA|Vigore|Resistenza)[\s]*:[\s]*(\d+|Var|Variabile)/i,
            /Costo[\s]*:[\s]*(\d+|Var|Variabile)[\s]*(?:RES|STA|Vigore|Resistenza)/i,
            /Stamina[\s]*:[\s]*(\d+|Var|Variabile)/i,
            /Cost(?:[\s]+in)?[\s]*(?:STA|Vigor)[\s]*:[\s]*(\d+|Var|Variable)/i // fallback english
        ];
        
        let foundCost = null;
        let minIndex = 999;
        
        for (const rx of costRegexes) {
            const rxMatch = searchArea.match(rx);
            if (rxMatch && rxMatch.index < minIndex) {
                minIndex = rxMatch.index;
                foundCost = rxMatch[1].trim();
            }
        }
        
        if (foundCost) {
            const textBeforeCost = searchArea.substring(0, minIndex);
            
            let containsOtherSpell = false;
            for (const otherName of allSpellNames) {
                if (otherName === spell.cleanName) continue;
                if (otherName.length < 5) continue;
                
                const otherRegexStr = otherName.split(' ').map(w => w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('\\s+');
                const otherRegex = new RegExp(otherRegexStr, 'i');
                
                // Be careful not to trip over partial matches of the SAME spell (e.g. "Incubo" in "L'Incubo")
                if (spell.cleanName.includes(otherName)) continue; 
                
                if (otherRegex.test(textBeforeCost)) {
                    containsOtherSpell = true;
                    break;
                }
            }
            
            if (!containsOtherSpell) {
                bestStamina = foundCost;
                break;
            }
        }
    }
    
    // For Maledizioni, etc. that might not have Costo in RES, we keep "Non trovato"
    if (bestStamina.length > 25) bestStamina = bestStamina.substring(0, 20) + '...';
    spell.extractedStamina = bestStamina;
}

const groupedSpells = spells.reduce((acc, spell) => {
    if (!acc[spell.type]) acc[spell.type] = [];
    acc[spell.type].push(spell);
    return acc;
}, {});

let md = '# Report Tutte Attività Magiche\n\n';
md += '> [!INFO]\n> Questo report incrocia i dati JSON attuali con i Costi in RES / STA / Vigore estratti dai PDF dei manuali.\n> **Ricerca rigorosa**: Lo script scarta automaticamente i risultati se incontra un altro nome di magia nel testo intermedio.\n\n';

for (const type of Object.keys(groupedSpells).sort()) {
    md += `## ${type.toUpperCase()}\n\n`;
    md += '| Nome | Manuale | Costo Attuale (JSON) | Nuovo Costo (Manuale) | Elemento | Livello | Percorso JSON |\n';
    md += '|---|---|---|---|---|---|---|\n';
    
    const group = groupedSpells[type].sort((a, b) => a.name.localeCompare(b.name));
    for (const spell of group) {
        let extracted = spell.extractedStamina;
        if (extracted !== 'Non trovato') {
            extracted = `**${extracted}**`;
        }
        md += `| ${spell.name} | ${spell.sourcebook} | ${spell.stamina} | ${extracted} | ${spell.source} | ${spell.level} | \`${spell.path}\` |\n`;
    }
    md += '\n';
}

fs.writeFileSync(reportPath, md, 'utf8');
console.log('Report estratto e aggiornato con successo in:', reportPath);
