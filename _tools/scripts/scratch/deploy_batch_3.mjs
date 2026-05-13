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
    { src: 'schema_rinforzo_in_fibra_webp_1778601925472.png', dest: 'schema_rinforzo_in_fibra.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'schema_rinforzo_nano_webp_1778601942287.png', dest: 'schema_rinforzo_nano.webp', rel: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics' },
    { src: 'layton_hermann_webp_1778601958976.png', dest: 'layton_hermann.webp', rel: 'BESTIARIO/witcher-characters' },
    { src: 'la_strega_di_rupe_della_lince_webp_1778601975485.png', dest: 'la_strega_di_rupe_della_lince.webp', rel: 'BESTIARIO/witcher-characters' },
    { src: 'leblanc_de_surmann_webp_1778601992604.png', dest: 'leblanc_de_surmann.webp', rel: 'BESTIARIO/witcher-characters' },
    { src: 'louise_van_adelaide_webp_1778602011452.png', dest: 'louise_van_adelaide.webp', rel: 'BESTIARIO/witcher-characters' },
    { src: 'pardus_di_korath_webp_1778602028398.png', dest: 'pardus_di_korath.webp', rel: 'BESTIARIO/witcher-characters' },
    { src: 'rodolf_kazmer_webp_1778602044106.png', dest: 'rodolf_kazmer.webp', rel: 'BESTIARIO/witcher-characters' },
    { src: 'elias_von_drexel_webp_1778602060382.png', dest: 'elias_von_drexel.webp', rel: 'BESTIARIO/witcher-characters' },
    { src: 'balestra_dell_orso_webp_1778602079138.png', dest: 'balestra_dell_orso.webp', rel: 'EQUIPAGGIAMENTO/witcher-weapons' }
];

async function deploy() {
    console.log("🚀 Starting Batch 3 Deployment...");
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
