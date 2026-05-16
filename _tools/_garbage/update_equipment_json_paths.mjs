import fs from 'fs';
import path from 'path';

const BASE_PATH = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main';
const TARGET_DIR = path.join(BASE_PATH, '_tools/src-packs/EQUIPAGGIAMENTO');

function updateJsonPaths(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            updateJsonPaths(fullPath);
        } else if (entry.name.endsWith('.json')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content;

            // Pattern 1: Move from any subfolder of EQUIPAGGIAMENTO_E_TRASPORTI to flat EQUIPAGGIAMENTO
            // Example: assets/EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/ -> assets/EQUIPAGGIAMENTO/witcher-weapons/
            updatedContent = updatedContent.replace(
                /assets\/EQUIPAGGIAMENTO_E_TRASPORTI\/[^/]+\/([^/]+)\//g,
                'assets/EQUIPAGGIAMENTO/$1/'
            );

            // Special Case: Chaos was merged into equipment
            updatedContent = updatedContent.replace(
                /assets\/EQUIPAGGIAMENTO\/witcher-special-chaos\//g,
                'assets/EQUIPAGGIAMENTO/witcher-equipment/'
            );

            if (content !== updatedContent) {
                console.log(`Updated paths in ${entry.name}`);
                fs.writeFileSync(fullPath, updatedContent);
            }
        }
    }
}

console.log("🛠️ Aggiornamento percorsi interni JSON in EQUIPAGGIAMENTO...");
updateJsonPaths(TARGET_DIR);
console.log("✅ Aggiornamento completato!");
