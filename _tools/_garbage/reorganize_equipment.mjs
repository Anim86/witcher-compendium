import fs from 'fs';
import path from 'path';

const BASE_PATH = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main';
const SRC_PACKS = path.join(BASE_PATH, '_tools/src-packs');
const ASSETS = path.join(BASE_PATH, 'witcher-compendium/assets');
const OLD_NAME = 'EQUIPAGGIAMENTO_E_TRASPORTI';
const NEW_NAME = 'EQUIPAGGIAMENTO';

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
    console.log("🚀 Avvio riorganizzazione Equipaggiamento...");

    // 1. Accorpamento Chaos -> Equipment
    console.log("📦 Accorpamento Chaos in Equipment...");
    const chaosSrc = path.join(SRC_PACKS, OLD_NAME, 'Attrezzatura_e_Oggetti/witcher-special-chaos');
    const equipSrc = path.join(SRC_PACKS, OLD_NAME, 'Attrezzatura_e_Oggetti/witcher-equipment');
    moveFolderContents(chaosSrc, equipSrc);
    
    const chaosAssets = path.join(ASSETS, OLD_NAME, 'Attrezzatura_e_Oggetti/witcher-special-chaos');
    const equipAssets = path.join(ASSETS, OLD_NAME, 'Attrezzatura_e_Oggetti/witcher-equipment');
    moveFolderContents(chaosAssets, equipAssets);

    // 2. Accorpamento Protesi -> Equipment (se rimasti)
    console.log("📦 Accorpamento Protesi in Equipment...");
    const protesiSrc = path.join(SRC_PACKS, OLD_NAME, 'Protesi/witcher-equipment');
    moveFolderContents(protesiSrc, equipSrc);
    const protesiAssets = path.join(ASSETS, OLD_NAME, 'Protesi/witcher-equipment');
    moveFolderContents(protesiAssets, equipAssets);

    // 3. Appiattimento e Ridenominazione
    console.log("📐 Appiattimento struttura...");
    const tempBase = path.join(SRC_PACKS, "TEMP_EQUIP");
    const tempAssets = path.join(ASSETS, "TEMP_EQUIP");
    if (!fs.existsSync(tempBase)) fs.mkdirSync(tempBase);
    if (!fs.existsSync(tempAssets)) fs.mkdirSync(tempAssets);

    const subfolders = ['Armi_e_Armature', 'Attrezzatura_e_Oggetti', 'Reliquie_e_Artefatti', 'Trasporti', 'Protesi'];
    
    for (const sub of subfolders) {
        const sDir = path.join(SRC_PACKS, OLD_NAME, sub);
        const aDir = path.join(ASSETS, OLD_NAME, sub);
        
        if (fs.existsSync(sDir)) {
            const leaves = fs.readdirSync(sDir);
            for (const leaf of leaves) {
                const leafPath = path.join(sDir, leaf);
                if (fs.lstatSync(leafPath).isDirectory()) {
                    console.log(`Flattening src leaf: ${leaf}`);
                    moveFolderContents(leafPath, path.join(tempBase, leaf));
                }
            }
        }
        if (fs.existsSync(aDir)) {
            const leaves = fs.readdirSync(aDir);
            for (const leaf of leaves) {
                const leafPath = path.join(aDir, leaf);
                if (fs.lstatSync(leafPath).isDirectory()) {
                    console.log(`Flattening asset leaf: ${leaf}`);
                    moveFolderContents(leafPath, path.join(tempAssets, leaf));
                }
            }
        }
    }

    // 4. Pulizia e Ridenominazione finale
    console.log("🧹 Pulizia vecchia struttura...");
    fs.rmSync(path.join(SRC_PACKS, OLD_NAME), { recursive: true, force: true });
    fs.rmSync(path.join(ASSETS, OLD_NAME), { recursive: true, force: true });

    console.log("🏷️ Ridenominazione in EQUIPAGGIAMENTO...");
    fs.renameSync(tempBase, path.join(SRC_PACKS, NEW_NAME));
    fs.renameSync(tempAssets, path.join(ASSETS, NEW_NAME));

    console.log("✨ Riorganizzazione completata con successo!");
}

reorganize();
