const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/temp_images';
const destDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/assets/EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons';

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

async function processFiles() {
    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.png'));
    
    for (const file of files) {
        const sourcePath = path.join(sourceDir, file);
        const baseName = path.parse(file).name;
        const destPath = path.join(destDir, baseName + '.webp');
        
        try {
            await sharp(sourcePath)
                .resize(512, 512)
                .webp({ quality: 80 })
                .toFile(destPath);
            console.log(`✅ Processato: ${file} -> ${baseName}.webp`);
        } catch (err) {
            console.error(`❌ Errore processando ${file}:`, err);
        }
    }
}

processFiles().then(() => console.log('✨ Deploy completato.'));
