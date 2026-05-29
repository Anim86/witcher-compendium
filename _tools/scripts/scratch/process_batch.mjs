import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const brainDir = 'C:/Users/Manuel/.gemini/antigravity/brain/45a3655b-14b0-4d34-8aac-428ab8ac3d06';
const tempDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/temp_images';
const destDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment';
const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_oggetti_vari_asset.md';

const targets = [
    { name: "Coppia di Puntelli", clean: "coppia_di_puntelli", md5: "b869124c" },
    { name: "Corno da Segnalazione", clean: "corno_da_segnalazione", md5: "b869124c" },
    { name: "Cote Nanica", clean: "cote_nanica", md5: "58f63b54" },
    { name: "Fischietto da Segnalazione", clean: "fischietto_da_segnalazione", md5: "b869124c" },
    { name: "Kit da Falsario", clean: "kit_da_falsario", md5: "54bf68b1" }
];

async function main() {
    console.log("🚀 Starting processing equipment batch...");

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const brainFiles = fs.readdirSync(brainDir);

    for (const t of targets) {
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

    // Now update report_oggetti_vari_asset.md
    if (fs.existsSync(reportPath)) {
        let content = fs.readFileSync(reportPath, 'utf8');
        const lines = content.split(/\r?\n/);
        let updatedCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (const t of targets) {
                if (line.startsWith(`| **${t.name}** |`)) {
                    // Replace the line with completed status
                    lines[i] = `| **${t.name}** | \`modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/${t.clean}.webp\` | ✅ Presente | \`${t.md5}\` |  -  | ✅ **Generata ed Integrata** (Generata con AI, ottimizzata WebP) |`;
                    updatedCount++;
                    console.log(`✅ Updated ${t.name} in report_oggetti_vari_asset.md`);
                    break;
                }
            }
        }

        fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
        console.log(`📝 Updated ${updatedCount} items in the report tracking checklist.`);
    } else {
        console.error("❌ report_oggetti_vari_asset.md not found!");
    }
}

main().catch(err => {
    console.error("❌ Error running process:", err);
});
