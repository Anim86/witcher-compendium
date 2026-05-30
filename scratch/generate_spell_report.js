const fs = require('fs');
const path = require('path');

const spellsDir = 'E:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/MAGIA/witcher-spells';
const reportPath = 'E:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_incantesimi.md';

function generateReport() {
    let md = '# Report Incantesimi (Spells)\n\n';
    md += '| Nome | Costo Stamina | Percorso JSON |\n';
    md += '|---|---|---|\n';

    const files = fs.readdirSync(spellsDir).filter(f => f.endsWith('.json'));
    
    // Raccogli i dati
    const spells = [];
    for (const file of files) {
        const fullPath = path.join(spellsDir, file);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        
        let stamina = data.system?.stamina !== undefined ? data.system.stamina : 'N/A';
        if (data.system?.staminaIsVar) {
            stamina += ' (Var)';
        }
        
        const relPath = `_tools/src-packs/MAGIA/witcher-spells/${file}`;
        
        spells.push({
            name: data.name,
            stamina: stamina,
            path: relPath
        });
    }

    // Ordina per nome
    spells.sort((a, b) => a.name.localeCompare(b.name));

    for (const spell of spells) {
        md += `| ${spell.name} | ${spell.stamina} | \`${spell.path}\` |\n`;
    }

    fs.writeFileSync(reportPath, md, 'utf8');
    console.log('Report generato con successo:', reportPath);
}

generateReport();
