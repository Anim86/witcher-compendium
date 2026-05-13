import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const BRAIN_DIR = 'C:/Users/Manuel/.gemini/antigravity/brain/4a408e5d-e67b-4a6b-9a77-62f4a96b8105';
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');

const BATCH_MAPPING = [
    { src: 'lupo_spada_lunga_reliquia_webp_1778602172154.png', dest: 'lupo_spada_lunga_reliquia.webp', rel: 'EQUIPAGGIAMENTO/witcher-weapons' },
    { src: 'pugnale_di_diaspro_sanguigno_webp_1778602188507.png', dest: 'pugnale_di_diaspro_sanguigno.webp', rel: 'EQUIPAGGIAMENTO/witcher-weapons' },
    { src: 'scorpione_webp_1778602205696.png', dest: 'scorpione.webp', rel: 'EQUIPAGGIAMENTO/witcher-weapons' },
    { src: 'spada_d_acciaio_della_manticora_webp_1778602227247.png', dest: 'spada_d_acciaio_della_manticora.webp', rel: 'EQUIPAGGIAMENTO/witcher-weapons' },
    { src: 'spada_d_acciaio_della_vipera_webp_1778602251564.png', dest: 'spada_d_acciaio_della_vipera.webp', rel: 'EQUIPAGGIAMENTO/witcher-weapons' },
    { src: 'spada_d_acciaio_dell_orso_webp_1778602267125.png', dest: 'spada_d_acciaio_dell_orso.webp', rel: 'EQUIPAGGIAMENTO/witcher-weapons' },
    { src: 'spada_d_argento_della_manticora_webp_1778602289697.png', dest: 'spada_d_argento_della_manticora.webp', rel: 'EQUIPAGGIAMENTO/witcher-weapons' }
];

async function deploy() {
    console.log("🚀 Starting Batch 4 Deployment...");
    let success = 0;
    let failed = 0;

    const tempOutDir = path.join(REPO_ROOT, 'temp_deploy');
    if (!fs.existsSync(tempOutDir)) fs.mkdirSync(tempOutDir);

    for (const item of BATCH_MAPPING) {
        const srcPath = path.join(BRAIN_DIR, item.src);
        const destDir = path.join(ASSETS_ROOT, item.rel);
        const destPath = path.join(destDir, item.dest);

        if (!fs.existsSync(srcPath)) {
            console.error(`❌ Source not found: ${item.src}`);
            failed++;
            continue;
        }

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        console.log(`Processing: ${item.src} -> ${item.dest}`);
        try {
            const cmd = `npx -y sharp-cli -i "${srcPath}" -o "${tempOutDir}" --format webp --quality 80 resize 512 512`;
            execSync(cmd, { stdio: 'inherit' });
            
            const generatedName = path.parse(item.src).name + ".webp";
            const generatedPath = path.join(tempOutDir, generatedName);
            
            if (fs.existsSync(generatedPath)) {
                fs.copyFileSync(generatedPath, destPath);
                fs.unlinkSync(generatedPath);
                console.log(`   ✅ Deployed to ${item.rel}/${item.dest}`);
                success++;
            } else {
                console.error(`   ❌ Failed to find generated file: ${generatedName}`);
                failed++;
            }
        } catch (err) {
            console.error(`   ❌ Error processing ${item.src}: ${err.message}`);
            failed++;
        }
    }

    console.log(`\nDeployment Summary: ${success} successful, ${failed} failed.`);
}

deploy();
