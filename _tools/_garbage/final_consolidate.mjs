import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_ROOT = path.join(REPO_ROOT, '_tools', 'src-packs');
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const ORPHAN_ASSETS_DIR = path.join(ASSETS_ROOT, 'EQUIPAGGIAMENTO_E_TRASPORTI', '_review_orphans');

async function main() {
    console.log("🚀 Consolidamento Finale Asset...");
    let fixed = 0;

    const walk = (dir) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith('.json')) {
                try {
                    let content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    if (content.img && content.img.includes('_review_orphans')) {
                        const imgName = path.basename(content.img);
                        const srcImgPath = path.join(ORPHAN_ASSETS_DIR, imgName);
                        
                        if (fs.existsSync(srcImgPath)) {
                            const jsonRelPath = path.relative(SRC_ROOT, fullPath);
                            const packDir = path.dirname(jsonRelPath);
                            const destAssetDir = path.join(ASSETS_ROOT, packDir);
                            const destImgPath = path.join(destAssetDir, imgName);

                            if (!fs.existsSync(destAssetDir)) fs.mkdirSync(destAssetDir, { recursive: true });
                            
                            // Copia se non esiste o se diverso
                            if (!fs.existsSync(destImgPath) || fs.statSync(destImgPath).size !== fs.statSync(srcImgPath).size) {
                                fs.copyFileSync(srcImgPath, destImgPath);
                                console.log(`  ✅ Migrata immagine: ${imgName} -> ${packDir}`);
                            }

                            content.img = `modules/witcher-compendium/assets/${packDir.replace(/\\/g, '/')}/${imgName}`;
                            fs.writeFileSync(fullPath, JSON.stringify(content, null, 4), 'utf8');
                            fixed++;
                        } else {
                            console.warn(`  ⚠️ Immagine sorgente non trovata: ${imgName} per ${content.name}`);
                        }
                    }
                } catch (e) {}
            }
        }
    };

    walk(SRC_ROOT);
    console.log(`\n✅ Consolidamento completato. Item sistemati: ${fixed}`);
}

main().catch(console.error);
