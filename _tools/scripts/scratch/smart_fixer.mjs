import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium/assets');

const GENERIC_SIZES = ['18154', '15834', '15064', '9386', '14848', '12958', '13038', '17144', '8904'];

function normalizeName(name) {
    return name.toLowerCase()
        .replace(/\.webp$/, '')
        .replace(/_/g, ' ')
        .replace(/\(acciaio\)|\(argento\)|\(zanna\)|\(pietra del potere\)|\(balestra\)|\(balista\)/g, '')
        .replace(/formula|schema/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

const allAssets = [];

function scan(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'ALCHIMIA_E_ARTIGIANATO') { // Escludiamo Alchimia come richiesto
                scan(fullPath);
            }
        } else if (file.endsWith('.webp')) {
            allAssets.push({
                path: fullPath,
                relPath: path.relative(ASSETS_ROOT, fullPath),
                name: file,
                norm: normalizeName(file),
                size: stat.size,
                isGeneric: GENERIC_SIZES.includes(stat.size.toString())
            });
        }
    }
}

scan(ASSETS_ROOT);

const generics = allAssets.filter(a => a.isGeneric);
const valids = allAssets.filter(a => !a.isGeneric);

const fixes = [];

for (const gen of generics) {
    // Cerchiamo un corrispettivo valido con lo stesso nome normalizzato
    const candidates = valids.filter(v => v.norm === gen.norm || v.norm.includes(gen.norm) || gen.norm.includes(v.norm));
    
    if (candidates.length > 0) {
        // Prendiamo il candidato con il nome più simile o semplicemente il primo se ce n'è uno solo
        const best = candidates.sort((a, b) => Math.abs(a.norm.length - gen.norm.length) - Math.abs(b.norm.length - gen.norm.length))[0];
        
        fixes.push({
            generic: gen.relPath,
            replacement: best.relPath,
            genSize: gen.size,
            repSize: best.size
        });
    }
}

let report = "# Proposta di Riparazione Asset Generici\n\n";
report += "Ho trovato questi corrispettivi validi per gli asset che attualmente risultano generici.\n";
report += "Se approvi, posso copiare il file 'Replacement' sopra il file 'Generic'.\n\n";

fixes.forEach(f => {
    report += `### 🛠️ Riparazione: ${path.basename(f.generic)}\n`;
    report += `- **Generico (da sostituire)**: \`${f.generic}\` (${f.genSize} bytes)\n`;
    report += `- **Valido (trovato)**: \`${f.replacement}\` (${f.repSize} bytes)\n`;
    report += "\n";
});

fs.writeFileSync(path.join(REPO_ROOT, 'scratch/smart_fix_proposal.md'), report);
console.log(`Trovate ${fixes.length} possibili riparazioni.`);
