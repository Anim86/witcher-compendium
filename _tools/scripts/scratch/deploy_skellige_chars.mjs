import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assets = [
    {
        src: 'backup_images/personaggi/Iorveth.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/iorveth.webp'
    },
    {
        src: 'backup_images/personaggi/mikaela_vergini_di_ferro.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/mikaela_vergini_di_ferro.webp'
    },
    {
        src: 'backup_images/personaggi/skuld_vergini_di_ferro.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/skuld_vergini_di_ferro.webp'
    }
];

async function processImages() {
    for (const asset of assets) {
        const srcPath = path.resolve(asset.src);
        const destPath = path.resolve(asset.dest);

        if (fs.existsSync(srcPath)) {
            console.log(`Processing ${asset.src}...`);
            await sharp(srcPath)
                .resize(512, 512, { fit: 'cover' })
                .webp({ quality: 85 })
                .toFile(destPath);
            console.log(`Updated: ${asset.dest}`);
        } else {
            console.error(`Source not found: ${srcPath}`);
        }
    }
}

processImages().catch(console.error);
