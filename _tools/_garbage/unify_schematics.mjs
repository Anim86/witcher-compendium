import fs from 'fs';
import path from 'path';

const BASE_PATH = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main';
const SRC_SCHEMATICS = path.join(BASE_PATH, '_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione');
const ASSETS_SCHEMATICS = path.join(BASE_PATH, 'witcher-compendium/assets/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione');

function moveFolderContents(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    
    const files = fs.readdirSync(src);
    for (const file of files) {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        if (fs.lstatSync(srcFile).isDirectory()) {
            moveFolderContents(srcFile, destFile);
        } else {
            console.log(`Moving ${file}...`);
            fs.renameSync(srcFile, destFile);
        }
    }
}

async function mergeSchematics() {
    console.log("🚀 Avvio unificazione Schemi...");

    const masterSrc = path.join(SRC_SCHEMATICS, 'witcher-schematics');
    const masterAssets = path.join(ASSETS_SCHEMATICS, 'witcher-schematics');

    // 1. Move from Racconti to Master
    console.log("📦 Spostamento Schemi (Racconti) nel pack Master...");
    moveFolderContents(path.join(SRC_SCHEMATICS, 'witcher-schematics-racconti'), masterSrc);
    moveFolderContents(path.join(ASSETS_SCHEMATICS, 'witcher-schematics-racconti'), masterAssets);

    // 2. Pulizia cartelle vuote
    console.log("🧹 Pulizia...");
    const toRemove = [
        path.join(SRC_SCHEMATICS, 'witcher-schematics-racconti'),
        path.join(ASSETS_SCHEMATICS, 'witcher-schematics-racconti')
    ];
    for (const p of toRemove) {
        if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
    }

    // 3. Update internal paths in the Master pack
    console.log("🛠️ Aggiornamento percorsi interni JSON...");
    const entries = fs.readdirSync(masterSrc);
    for (const file of entries) {
        if (file.endsWith('.json')) {
            const fullPath = path.join(masterSrc, file);
            const content = fs.readFileSync(fullPath, 'utf8');
            let updatedContent = content.replace(
                /assets\/ALCHIMIA_E_ARTIGIANATO\/Schemi_di_Fabbricazione\/witcher-schematics-racconti\//g,
                'assets/ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics/'
            );
            if (content !== updatedContent) {
                console.log(`Updated paths in ${file}`);
                fs.writeFileSync(fullPath, updatedContent);
            }
        }
    }

    console.log("✨ Unificazione Schemi completata!");
}

mergeSchematics();
