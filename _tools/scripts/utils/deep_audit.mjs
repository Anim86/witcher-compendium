import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_ROOT = path.join(REPO_ROOT, '_tools', 'src-packs');
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const AUDIT_FILE = path.join(REPO_ROOT, 'scratch', 'generic_assets_audit.md');

// Dimensioni note dei placeholder (estratte da analisi precedenti)
const PLACEHOLDER_SIZES = new Set([
    17144, // Generico Oggetti (es: elias_von_drexel, layton_hermann)
    13038, // Generico Artistica (es: compartimento_segreto)
    5464,  // Generico Balestra
    9250,  // Munizioni normali
    2324,  // Spada d'arme (potenziale placeholder)
    4676   // Spada di ferro (potenziale placeholder)
]);

async function main() {
    console.log("🚀 Avvio Audit Profondo Asset Generici...");
    
    const assetUsage = {}; // path -> [itemNames]
    const assetSizes = {}; // path -> size

    // 1. Scansione di tutti i JSON per mappare l'uso degli asset
    const walkJson = (dir) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walkJson(fullPath);
            } else if (file.endsWith('.json')) {
                try {
                    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    if (content.img) {
                        const imgPath = content.img.replace('modules/witcher-compendium/assets/', '');
                        if (!assetUsage[imgPath]) assetUsage[imgPath] = [];
                        assetUsage[imgPath].push(content.name);
                    }
                } catch (e) {}
            }
        }
    };
    walkJson(SRC_ROOT);

    // 2. Analisi fisica degli asset utilizzati
    console.log("Analisi file fisici...");
    const genericAssets = [];
    const sharedAssets = [];

    for (const [relPath, items] of Object.entries(assetUsage)) {
        const fullPath = path.join(ASSETS_ROOT, relPath);
        if (fs.existsSync(fullPath)) {
            const size = fs.statSync(fullPath).size;
            assetSizes[relPath] = size;

            // Criterio 1: Dimensione nota dei placeholder
            if (PLACEHOLDER_SIZES.has(size)) {
                genericAssets.push({ path: relPath, size, items });
            } 
            // Criterio 2: Asset condiviso da molti item (più di 3, escludendo casi noti)
            else if (items.length > 3 && !relPath.includes('default') && !relPath.includes('placeholder')) {
                sharedAssets.push({ path: relPath, size, items });
            }
        } else {
            console.warn(`  ⚠️ Asset mancante nel filesystem: ${relPath} (usato da ${items.join(', ')})`);
        }
    }

    // 3. Generazione nuovo file di Audit
    let auditContent = "# Audit Asset Generici Aggiornato\n\n";
    auditContent += "Questo file elenca gli asset che risultano essere placeholder o eccessivamente condivisi.\n\n";

    auditContent += "## 📂 Asset con Dimensioni Placeholder Note\n";
    // Raggruppo per dimensione
    const groupedBySize = {};
    genericAssets.forEach(a => {
        if (!groupedBySize[a.size]) groupedBySize[a.size] = [];
        groupedBySize[a.size].push(a);
    });

    for (const [size, assets] of Object.entries(groupedBySize)) {
        auditContent += `### Dimensione: ${size} bytes\n`;
        assets.forEach(a => {
            auditContent += `- **${path.basename(a.path)}** (${a.path})\n`;
            auditContent += `  - Usato da: ${a.items.slice(0, 5).join(', ')}${a.items.length > 5 ? '...' : ''}\n`;
        });
        auditContent += "\n";
    }

    auditContent += "## 📂 Asset Altamente Condivisi (Sospetti Placeholder)\n";
    sharedAssets.sort((a, b) => b.items.length - a.items.length).forEach(a => {
        auditContent += `- **${path.basename(a.path)}** (${a.path}) - **${a.items.length} utilizzi**\n`;
        auditContent += `  - Esempi: ${a.items.slice(0, 5).join(', ')}\n`;
    });

    fs.writeFileSync(AUDIT_FILE, auditContent, 'utf8');
    console.log(`\n✅ Audit completato. File aggiornato in: ${AUDIT_FILE}`);
}

main().catch(console.error);
