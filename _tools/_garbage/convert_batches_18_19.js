const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = 'e:\\AntigravitiProgetti\\CompendioTheWitcher';
const TEMP_BASE = path.join(ROOT, 'temp_images');
const ASSETS_BASE = path.join(ROOT, 'witcher-compendium', 'assets', 'ALCHIMIA_E_ARTIGIANATO');

const mappings = [
    {
        source: path.join(TEMP_BASE, 'witcher-dlc-ap-alchemy'),
        target: path.join(ASSETS_BASE, 'Formule_e_Ricette', 'witcher-dlc-ap-alchemy')
    },
    {
        source: path.join(TEMP_BASE, 'witcher-dlc-ts-alchemy'),
        target: path.join(ASSETS_BASE, 'Formule_e_Ricette', 'witcher-dlc-ts-alchemy')
    },
    {
        source: path.join(TEMP_BASE, 'witcher-components'),
        target: path.join(ASSETS_BASE, 'Componenti', 'witcher-components')
    }
];

async function processImages() {
    for (const mapping of mappings) {
        if (!fs.existsSync(mapping.source)) {
            console.log(`Source directory not found: ${mapping.source}`);
            continue;
        }

        if (!fs.existsSync(mapping.target)) {
            console.log(`Creating target directory: ${mapping.target}`);
            fs.mkdirSync(mapping.target, { recursive: true });
        }

        const files = fs.readdirSync(mapping.source).filter(f => f.toLowerCase().endsWith('.png'));
        console.log(`Processing ${files.length} files in ${mapping.source}...`);

        for (const file of files) {
            const sourcePath = path.join(mapping.source, file);
            const targetName = path.parse(file).name + '.webp';
            const targetPath = path.join(mapping.target, targetName);

            try {
                await sharp(sourcePath)
                    .webp({ quality: 85, lossless: false })
                    .toFile(targetPath);
                console.log(`  Converted: ${file} -> ${targetName}`);
            } catch (err) {
                console.error(`  Error converting ${file}:`, err);
            }
        }
    }
    console.log('Done!');
}

processImages();
