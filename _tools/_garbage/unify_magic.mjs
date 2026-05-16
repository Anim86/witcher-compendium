import fs from 'fs';
import path from 'path';

const BASE_PATH = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main';

function mergePacks(masterName, sourceNames, subPath) {
    const SRC_ROOT = path.join(BASE_PATH, '_tools/src-packs', subPath);
    const ASSET_ROOT = path.join(BASE_PATH, 'witcher-compendium/assets', subPath);

    const masterSrc = path.join(SRC_ROOT, masterName);
    const masterAsset = path.join(ASSET_ROOT, masterName);

    if (!fs.existsSync(masterSrc)) fs.mkdirSync(masterSrc, { recursive: true });
    if (!fs.existsSync(masterAsset)) fs.mkdirSync(masterAsset, { recursive: true });

    for (const sourceName of sourceNames) {
        const sourceSrc = path.join(SRC_ROOT, sourceName);
        const sourceAsset = path.join(ASSET_ROOT, sourceName);

        if (fs.existsSync(sourceSrc)) {
            console.log(`Merging SRC: ${sourceName} -> ${masterName} in ${subPath}`);
            const files = fs.readdirSync(sourceSrc);
            for (const file of files) {
                const oldPath = path.join(sourceSrc, file);
                const newPath = path.join(masterSrc, file);
                
                // Update internal paths in JSON
                if (file.endsWith('.json')) {
                    let content = fs.readFileSync(oldPath, 'utf8');
                    const oldRelPath = `assets/${subPath}/${sourceName}/`;
                    const newRelPath = `assets/${subPath}/${masterName}/`;
                    content = content.replace(new RegExp(oldRelPath, 'g'), newRelPath);
                    fs.writeFileSync(oldPath, content);
                }
                
                fs.renameSync(oldPath, newPath);
            }
            fs.rmdirSync(sourceSrc);
        }

        if (fs.existsSync(sourceAsset)) {
            console.log(`Merging ASSETS: ${sourceName} -> ${masterName} in ${subPath}`);
            const files = fs.readdirSync(sourceAsset);
            for (const file of files) {
                const oldPath = path.join(sourceAsset, file);
                const newPath = path.join(masterAsset, file);
                if (fs.existsSync(newPath)) {
                   console.warn(`Asset collision: ${file} already exists in master. Skipping.`);
                   continue;
                }
                fs.renameSync(oldPath, newPath);
            }
            fs.rmdirSync(sourceAsset);
        }
    }
}

async function run() {
    console.log("🚀 Consolidamento Magia...");
    
    // Spells & Rituals (Already mostly done, but keeping for safety if re-run)
    mergePacks('witcher-spells', ['witcher-spells-chaos', 'witcher-spells-racconti'], 'MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali');
    mergePacks('witcher-rituals', ['witcher-rituals-chaos'], 'MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali');

    // Merge Hexes
    mergePacks('witcher-hexes', ['witcher-hexes-base'], 'MAGIA_E_MALEDIZIONI/Maledizioni_e_Fatture');

    // Merge Signs
    mergePacks('witcher-signs', ['witcher-signs-chaos'], 'MAGIA_E_MALEDIZIONI/Segni');
    
    console.log("✅ Consolidamento completato!");
}

run();
