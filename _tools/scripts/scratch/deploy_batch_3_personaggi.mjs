import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assets = [
    {
        src: 'backup_images/personaggi/artorius_vigo.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/artorius_vigo.webp'
    },
    {
        src: 'backup_images/personaggi/bandit.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/banditi.webp'
    },
    {
        src: 'backup_images/personaggi/bronwyn_occhiofino.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/bronwyn_occhiofino.webp'
    },
    {
        src: 'backup_images/personaggi/dormyn_di_gemmera.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/dormyn_di_gemmera.webp'
    },
    {
        src: 'backup_images/personaggi/drystan_di_nazair.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/drystan_di_nazair.webp'
    },
    {
        src: 'backup_images/personaggi/elgan_di_verden.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/elgan_di_verden.webp'
    },
    {
        src: 'backup_images/personaggi/sile_de_tancarville.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/sile_de_tancarville.webp'
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
