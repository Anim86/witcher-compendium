import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const srcPng = 'e:/AntigravitiProgetti/CompendioTheWitcher/temp_images/compartimento_segreto.png';
const destWebp = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/compartimento_segreto.webp';
const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_oggetti_vari_asset.md';

async function run() {
    console.log("🚀 Optimizing Compartimento Segreto...");
    
    if (!fs.existsSync(srcPng)) {
        console.error("❌ Source file not found: " + srcPng);
        process.exit(1);
    }
    
    // Optimize
    await sharp(srcPng)
        .resize(512, 512, { fit: 'inside' })
        .webp({ quality: 82 })
        .toFile(destWebp);
        
    console.log("✨ Optimized and saved to: " + destWebp);
    
    // Update report
    if (fs.existsSync(reportPath)) {
        let content = fs.readFileSync(reportPath, 'utf8');
        const targetLineStart = '| **Compartimento Segreto** |';
        const lines = content.split(/\r?\n/);
        let updated = false;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith(targetLineStart)) {
                // Change status from Errata to Presente, and mark as manual generation
                lines[i] = '| **Compartimento Segreto** | `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment/compartimento_segreto.webp` | ✅ Presente | `33efbccc` |  -  | ✅ **Ottimizzata ed Integrata** (Generata manualmente dall\'utente, ottimizzata WebP) |';
                updated = true;
                break;
            }
        }
        
        if (updated) {
            fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
            console.log("📝 Updated report_oggetti_vari_asset.md successfully.");
        } else {
            console.warn("⚠️ Could not find Compartimento Segreto row in report!");
        }
    } else {
        console.error("❌ Report file not found!");
    }
}

run().catch(err => {
    console.error("❌ Exception during execution:", err);
});
