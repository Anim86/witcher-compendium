import fs from 'fs';
import path from 'path';

const BASE_PATH = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main';
const ALCHIMIA_SRC = path.join(BASE_PATH, '_tools/src-packs/ALCHIMIA_E_ARTIGIANATO');
const ALCHIMIA_ASSETS = path.join(BASE_PATH, 'witcher-compendium/assets/ALCHIMIA_E_ARTIGIANATO');

function flattenFolder(basePath) {
    if (!fs.existsSync(basePath)) return;
    
    const subfolders = fs.readdirSync(basePath);
    for (const sub of subfolders) {
        const subPath = path.join(basePath, sub);
        if (fs.lstatSync(subPath).isDirectory()) {
            const packs = fs.readdirSync(subPath);
            for (const pack of packs) {
                const packPath = path.join(subPath, pack);
                const targetPath = path.join(basePath, pack);
                
                if (fs.lstatSync(packPath).isDirectory()) {
                    console.log(`Flattening pack ${pack} from ${sub}...`);
                    if (fs.existsSync(targetPath)) {
                        // Merge contents if target exists
                        const files = fs.readdirSync(packPath);
                        for (const file of files) {
                            fs.renameSync(path.join(packPath, file), path.join(targetPath, file));
                        }
                        fs.rmdirSync(packPath);
                    } else {
                        fs.renameSync(packPath, targetPath);
                    }
                }
            }
            // Remove the now empty subfolder
            if (fs.readdirSync(subPath).length === 0) {
                fs.rmdirSync(subPath);
            }
        }
    }
}

async function run() {
    console.log("🚀 Appiattimento ALCHIMIA_E_ARTIGIANATO...");
    flattenFolder(ALCHIMIA_SRC);
    flattenFolder(ALCHIMIA_ASSETS);
    console.log("✅ Appiattimento completato!");
}

run();
