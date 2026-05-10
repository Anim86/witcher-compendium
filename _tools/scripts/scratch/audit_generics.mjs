import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium/assets');

const placeholders = {
    '18154': 'Fisiche (Generica)',
    '15834': 'Sociale (Generica)',
    '15064': 'Sapere (Generica)',
    '9386': 'Combattimento (Generica)',
    '14848': 'Magiche (Generica)',
    '12958': 'Tecniche (Generica)',
    '13038': 'Artistiche (Generica)',
    '17144': 'Oggetti/Equipaggiamento (Generica)',
    '8904': 'Alchimia (Generica)'
};

const audit = {};
Object.values(placeholders).forEach(p => audit[p] = []);

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            // Escludiamo Alchimia come richiesto
            if (file !== 'ALCHIMIA_E_ARTIGIANATO') {
                walk(fullPath);
            }
        } else if (file.endsWith('.webp')) {
            const size = stat.size.toString();
            if (placeholders[size]) {
                const relPath = path.relative(ASSETS_ROOT, fullPath);
                // Escludiamo i file che SONO i placeholder stessi
                if (!relPath.includes('witcher-skills') && !relPath.includes('oggetti_disonesti.webp')) {
                    audit[placeholders[size]].push(file);
                }
            }
        }
    }
}

walk(ASSETS_ROOT);

let md = "# Audit Asset Generici (Esclusa Alchimia)\n\n";
md += "Questo file elenca tutti gli asset .webp che hanno le dimensioni esatte dei placeholder generici.\n\n";

for (const [category, items] of Object.entries(audit)) {
    if (items.length > 0) {
        md += `## 📂 Famiglia: ${category} (${items.length} elementi)\n`;
        items.forEach(item => {
            md += `- ${item}\n`;
        });
        md += "\n";
    }
}

fs.writeFileSync(path.join(REPO_ROOT, 'scratch/generic_assets_audit.md'), md);
console.log("Audit completato.");
