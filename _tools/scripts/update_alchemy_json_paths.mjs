import fs from 'fs';
import path from 'path';

const BASE_PATH = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main';
const TARGET_DIR = path.join(BASE_PATH, '_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Componenti/witcher-components');

function updateJsonPaths(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            updateJsonPaths(fullPath);
        } else if (entry.name.endsWith('.json')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content;

            // Pattern: Move from Diario/Racconti subfolders to main witcher-components
            updatedContent = updatedContent.replace(
                /assets\/ALCHIMIA_E_ARTIGIANATO\/Componenti\/witcher-components-(diario|racconti)\//g,
                'assets/ALCHIMIA_E_ARTIGIANATO/Componenti/witcher-components/'
            );

            if (content !== updatedContent) {
                console.log(`Updated paths in ${entry.name}`);
                fs.writeFileSync(fullPath, updatedContent);
            }
        }
    }
}

console.log("🛠️ Aggiornamento percorsi interni JSON in ALCHIMIA...");
updateJsonPaths(TARGET_DIR);
console.log("✅ Aggiornamento completato!");
