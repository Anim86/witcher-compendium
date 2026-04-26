const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = 'e:\\AntigravitiProgetti\\CompendioTheWitcher';
const TEMP_BASE = path.join(ROOT, 'temp_images');
const ASSETS_BASE = path.join(ROOT, 'witcher-compendium', 'assets');
const WORK_LIST_PATH = path.join(ROOT, 'scratch', 'work_list.json');

// Load work_list.json
const workList = JSON.parse(fs.readFileSync(WORK_LIST_PATH, 'utf8'));

// Flatten workList for easier lookup
const allItems = [];
for (const packName in workList) {
    workList[packName].forEach(item => {
        allItems.push({
            ...item,
            pack: packName
        });
    });
}

// Folders in temp_images to check for Batch 20
const sourceFolders = [
    'witcher-components',
    'witcher-components-diario',
    'witcher-components-mutageni-dw',
    'witcher-dlc-ms-components',
    'witcher-mutations',
    'witcher-mutazioni-tc',
    'witcher-schematics'
];

async function processImages() {
    console.log('Starting Batch 20 conversion...');
    
    for (const folder of sourceFolders) {
        const sourceDir = path.join(TEMP_BASE, folder);
        if (!fs.existsSync(sourceDir)) {
            console.log(`Skipping missing folder: ${folder}`);
            continue;
        }

        const files = fs.readdirSync(sourceDir).filter(f => f.toLowerCase().endsWith('.png'));
        console.log(`Processing ${files.length} files in ${folder}...`);

        for (const file of files) {
            const baseName = path.parse(file).name;
            const webpName = baseName + '.webp';
            
            // Find all mappings in work_list.json
            // We search by filename (baseName.webp)
            const matchingItems = allItems.filter(i => i.filename.toLowerCase() === webpName.toLowerCase());
            
            if (matchingItems.length === 0) {
                console.warn(`  Mapping not found for ${file}. Skipping.`);
                continue;
            }

            for (const item of matchingItems) {
                const sourcePath = path.join(sourceDir, file);
                const targetPath = path.join(ROOT, 'witcher-compendium', item.imgPath);
                const targetDir = path.dirname(targetPath);

                if (!fs.existsSync(targetDir)) {
                    console.log(`  Creating directory: ${targetDir}`);
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                try {
                    await sharp(sourcePath)
                        .webp({ quality: 90, lossless: false })
                        .toFile(targetPath);
                    console.log(`  Converted & Deployed: ${file} -> ${item.imgPath}`);
                } catch (err) {
                    console.error(`  Error processing ${file} for ${item.imgPath}:`, err);
                }
            }
        }
    }
    console.log('Batch 20 processing complete!');
}

processImages().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
