import fs from 'fs';
import path from 'path';

const BASE_PATH = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main';
const SRC_PACKS = path.join(BASE_PATH, '_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/Componenti');
const ASSETS = path.join(BASE_PATH, 'witcher-compendium/assets/ALCHIMIA_E_ARTIGIANATO/Componenti');

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

async function reorganize() {
    console.log("🚀 Avvio riorganizzazione Componenti...");

    const masterSrc = path.join(SRC_PACKS, 'witcher-components');
    const masterAssets = path.join(ASSETS, 'witcher-components');

    // 1. Merge Diario
    console.log("📦 Fusione Componenti (Diario)...");
    moveFolderContents(path.join(SRC_PACKS, 'witcher-components-diario'), masterSrc);
    moveFolderContents(path.join(ASSETS, 'witcher-components-diario'), masterAssets);

    // 2. Merge Racconti
    console.log("📦 Fusione Componenti (Racconti)...");
    moveFolderContents(path.join(SRC_PACKS, 'witcher-components-racconti'), masterSrc);
    moveFolderContents(path.join(ASSETS, 'witcher-components-racconti'), masterAssets);

    // 3. Ridenominazione Mutageni
    console.log("🏷️ Ridenominazione Mutageni...");
    const oldMutSrc = path.join(SRC_PACKS, 'witcher-components-mutageni-dw');
    const newMutSrc = path.join(SRC_PACKS, 'witcher-mutageni-dw');
    if (fs.existsSync(oldMutSrc)) fs.renameSync(oldMutSrc, newMutSrc);

    const oldMutAssets = path.join(ASSETS, 'witcher-components-mutageni-dw');
    const newMutAssets = path.join(ASSETS, 'witcher-mutageni-dw');
    if (fs.existsSync(oldMutAssets)) fs.renameSync(oldMutAssets, newMutAssets);

    // 4. Pulizia cartelle vuote
    console.log("🧹 Pulizia...");
    const toRemove = [
        path.join(SRC_PACKS, 'witcher-components-diario'),
        path.join(SRC_PACKS, 'witcher-components-racconti'),
        path.join(ASSETS, 'witcher-components-diario'),
        path.join(ASSETS, 'witcher-components-racconti')
    ];
    for (const p of toRemove) {
        if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
    }

    console.log("✨ Riorganizzazione Alchimia completata!");
}

reorganize();
