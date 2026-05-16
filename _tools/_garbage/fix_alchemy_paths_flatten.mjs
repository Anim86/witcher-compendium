import fs from 'fs';
import path from 'path';

const BASE_PATH = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main';
const ALCHIMIA_ROOT = path.join(BASE_PATH, '_tools/src-packs/ALCHIMIA_E_ARTIGIANATO');

const SUBFOLDERS = [
    'Componenti',
    'Mutageni',
    'Formule_e_Ricette',
    'Schemi_di_Fabbricazione'
];

function updateJsonPaths(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            updateJsonPaths(fullPath);
        } else if (entry.name.endsWith('.json')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content;

            for (const sub of SUBFOLDERS) {
                const regex = new RegExp(`assets/ALCHIMIA_E_ARTIGIANATO/${sub}/`, 'g');
                updatedContent = updatedContent.replace(regex, 'assets/ALCHIMIA_E_ARTIGIANATO/');
            }

            if (content !== updatedContent) {
                console.log(`Updated paths in ${entry.name}`);
                fs.writeFileSync(fullPath, updatedContent);
            }
        }
    }
}

console.log("🛠️ Aggiornamento percorsi interni JSON in ALCHIMIA (Flattening)...");
updateJsonPaths(ALCHIMIA_ROOT);
console.log("✅ Aggiornamento completato!");
