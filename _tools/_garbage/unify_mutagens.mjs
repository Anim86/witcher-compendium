import fs from 'fs';
import path from 'path';

const BASE_PATH = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main';
const SRC_COMPONENTS = path.join(BASE_PATH, '_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Componenti');
const SRC_MUTAGENS = path.join(BASE_PATH, '_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Mutageni');
const ASSETS_COMPONENTS = path.join(BASE_PATH, 'witcher-compendium/assets/ALCHIMIA_E_ARTIGIANATO/Componenti');
const ASSETS_MUTAGENS = path.join(BASE_PATH, 'witcher-compendium/assets/ALCHIMIA_E_ARTIGIANATO/Mutageni');

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

async function mergeMutagens() {
    console.log("🚀 Avvio unificazione Mutageni...");

    const masterSrc = path.join(SRC_MUTAGENS, 'witcher-mutations');
    const masterAssets = path.join(ASSETS_MUTAGENS, 'witcher-mutations');

    // 1. Move from DW to Master
    console.log("📦 Spostamento mutageni DW nel pack Master...");
    moveFolderContents(path.join(SRC_COMPONENTS, 'witcher-mutageni-dw'), masterSrc);
    moveFolderContents(path.join(ASSETS_COMPONENTS, 'witcher-mutageni-dw'), masterAssets);

    // 2. Pulizia cartelle vuote
    console.log("🧹 Pulizia...");
    const toRemove = [
        path.join(SRC_COMPONENTS, 'witcher-mutageni-dw'),
        path.join(ASSETS_COMPONENTS, 'witcher-mutageni-dw')
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
                /assets\/ALCHIMIA_E_ARTIGIANATO\/Componenti\/witcher-mutageni-dw\//g,
                'assets/ALCHIMIA_E_ARTIGIANATO/Mutageni/witcher-mutations/'
            );
            if (content !== updatedContent) {
                console.log(`Updated paths in ${file}`);
                fs.writeFileSync(fullPath, updatedContent);
            }
        }
    }

    console.log("✨ Unificazione Mutageni completata!");
}

mergeMutagens();
