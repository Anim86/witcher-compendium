import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assets = [
    {
        src: 'backup_images/personaggi/lady_fortuna_katakan.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/lady_fortuna_katakan.webp'
    },
    {
        src: 'backup_images/personaggi/la_stregonessa_katakan.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/la_stregonessa_katakan.webp'
    },
    {
        src: 'backup_images/personaggi/lo_jarl_katakan.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/lo_jarl_katakan.webp'
    },
    {
        src: 'backup_images/personaggi/maghi.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/maghi.webp'
    },
    {
        src: 'backup_images/personaggi/margarita_laux_antille.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/margarita_laux_antille.webp'
    },
    {
        src: 'backup_images/personaggi/prinny_prin_prin_katakan.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/prinny_prin_prin_katakan.webp'
    },
    {
        src: 'backup_images/personaggi/rhundin_artigiani_di_mahakam.png',
        dest: 'witcher-compendium/assets/BESTIARIO/witcher-characters/rhundin_artigiani_di_mahakam.webp'
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
