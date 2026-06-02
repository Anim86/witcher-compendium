import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const brainDir = 'C:/Users/Manuel/.gemini/antigravity/brain/45a3655b-14b0-4d34-8aac-428ab8ac3d06';
const tempDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/temp_images';
const destDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/assets/ALCHIMIA_E_ARTIGIANATO/witcher-schematics';
const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_schemi_asset.md';

const targets = [
    { name: "Scudo Temeriano", clean: "schema_scudo_temeriano" },
    { name: "Brache di Cuoio Lyriano", clean: "schema_brache_di_cuoio_lyriano" },
    { name: "Bastone", clean: "schema_bastone" },
    { name: "Bastone con Cristallo", clean: "schema_bastone_con_cristallo" },
    { name: "Bastone da Passeggio Elfico", clean: "schema_bastone_da_passeggio_elfico" },
    { name: "Bastone di Ferro", clean: "schema_bastone_di_ferro" },
    { name: "Bastone Gnomesco", clean: "schema_bastone_gnomesco" },
    { name: "Pugnale", clean: "schema_pugnale" },
    { name: "Daga a Rondelle Halfling", clean: "schema_daga_a_rondelle_halfling" },
    { name: "Jambiya", clean: "schema_jambiya" },
    { name: "Bastone Uncinato", clean: "schema_bastone_uncinato" },
    { name: "Asce da Lancio", clean: "schema_asce_da_lancio" }
];

async function main() {
    console.log("🚀 Starting processing batch...");

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
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
            // Replace "| [ ] | **Schema: Name**" with "| [x] | **Schema: Name**"
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
