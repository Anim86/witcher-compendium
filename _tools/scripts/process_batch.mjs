import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../');
const brainDir = 'C:/Users/Manuel/.gemini/antigravity/brain/1bee2bd6-1e4d-4155-95d2-1433390c7ed5';
const tempDir = path.join(REPO_ROOT, 'temp_images');
const destDir = path.join(REPO_ROOT, 'witcher-compendium/assets/ALCHIMIA_E_ARTIGIANATO/witcher-schematics');
const reportPath = path.join(REPO_ROOT, 'TO DO/report_schemi_asset.md');

const targets = [
    { name: "Gwyhyr Gnomesca", clean: "schema_gwyhyr_gnomesca" },
    { name: "Kord", clean: "schema_kord" },
    { name: "Krigsverd", clean: "schema_krigsverd" },
    { name: "Lama del Tir Tochair", clean: "schema_lama_del_tir_tochair" },
    { name: "Lama Vicovariana", clean: "schema_lama_vicovariana" },
    { name: "Lama Viroledana", clean: "schema_lama_viroledana" },
    { name: "Messer Elfico", clean: "schema_messer_elfico" }
];

async function main() {
    console.log("🚀 Starting processing batch from _tools/scripts...");

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    if (!fs.existsSync(brainDir)) {
        console.error(`❌ Brain directory not found: ${brainDir}`);
        return;
    }

    const brainFiles = fs.readdirSync(brainDir);

    for (const t of targets) {
        // Find the generated file in the brain folder
        const match = brainFiles.find(f => f.startsWith(t.clean) && f.endsWith('.png'));
        if (match) {
            const srcPath = path.join(brainDir, match);
            const tempPngPath = path.join(tempDir, `${t.clean}.png`);
            
            // Copy to temp_images
            fs.copyFileSync(srcPath, tempPngPath);
            console.log(`📌 Copied ${match} -> temp_images/${t.clean}.png`);

            // Optimize and output to destDir as webp
            const destWebpPath = path.join(destDir, `${t.clean}.webp`);
            
            await sharp(tempPngPath)
                .resize(512, 512, { fit: 'inside' })
                .webp({ quality: 82 })
                .toFile(destWebpPath);
                
            console.log(`✨ Optimized and saved: ${t.clean}.webp (512x512px WebP Q82)`);
        } else {
            console.warn(`⚠️ Could not find brain image starting with ${t.clean}`);
        }
    }

    // Now update report_schemi_asset.md
    if (fs.existsSync(reportPath)) {
        let content = fs.readFileSync(reportPath, 'utf8');
        let updatedCount = 0;
        
        for (const t of targets) {
            // We want to replace "| [ ] | **Schema: Spada d'Arme**" with "| [x] | **Schema: Spada d'Arme**"
            const searchStr = `| [ ] | **Schema: ${t.name}**`;
            const replaceStr = `| [x] | **Schema: ${t.name}**`;
            
            if (content.includes(searchStr)) {
                content = content.replace(searchStr, replaceStr);
                updatedCount++;
                console.log(`✅ Checked [x] for ${t.name} in report_schemi_asset.md`);
            }
        }
        
        fs.writeFileSync(reportPath, content, 'utf8');
        console.log(`📝 Updated ${updatedCount} items in the report tracking checklist.`);
    } else {
        console.error("❌ report_schemi_asset.md not found!");
    }
}

main().catch(err => {
    console.error("❌ Error running process:", err);
});
