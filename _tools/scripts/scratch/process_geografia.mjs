import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const tempDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/temp_images';
const destDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/assets/REGOLAMENTO_E_NARRATIVA/witcher-geografia';

const targets = [
    { src: "Impero di Nilfgaard.png", dest: "impero_di_nilfgaard.webp" },
    { src: "Skellige.png", dest: "isole_skellige.webp" }
];

async function main() {
    console.log("🚀 Starting processing geography batch...");

    for (const t of targets) {
        const srcPath = path.join(tempDir, t.src);
        const destPath = path.join(destDir, t.dest);

        if (fs.existsSync(srcPath)) {
            console.log(`📌 Found source image: ${t.src}`);
            
            // Optimize and output to destDir as webp
            await sharp(srcPath)
                .resize(1024, 1024, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 82 })
                .toFile(destPath);
                
            console.log(`✨ Optimized and saved: ${t.dest} (1024x1024px WebP Q82)`);
        } else {
            console.warn(`⚠️ Could not find source image at ${srcPath}`);
        }
    }

    console.log("✨ Geography processing completed!");
}

main().catch(err => {
    console.error("❌ Error running process:", err);
});
