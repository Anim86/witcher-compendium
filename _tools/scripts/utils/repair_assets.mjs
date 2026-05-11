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
    console.log("🚀 Riparazione Link Asset Mancanti...");
    let repaired = 0;

    const walk = (dir) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith('.json')) {
                try {
                    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    if (content.img) {
                        const relImgPath = content.img.replace('modules/witcher-compendium/assets/', '');
                        const fullImgPath = path.join(ASSETS_ROOT, relImgPath);

                        if (!fs.existsSync(fullImgPath)) {
                            // Il file manca! Lo cerco negli orphans
                            const imgName = path.basename(relImgPath);
                            const srcImgPath = path.join(ORPHAN_ASSETS_DIR, imgName);

                            if (fs.existsSync(srcImgPath)) {
                                const destDir = path.dirname(fullImgPath);
                                if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
                                
                                fs.copyFileSync(srcImgPath, fullImgPath);
                                console.log(`  🔧 Ripristinato: ${imgName} -> ${relImgPath}`);
                                repaired++;
                            }
                        }
                    }
                } catch (e) {}
            }
        }
    };

    walk(SRC_ROOT);
    console.log(`\n✅ Riparazione completata. Asset ripristinati: ${repaired}`);
}

main().catch(console.error);
