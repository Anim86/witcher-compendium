const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = 'e:\\AntigravitiProgetti\\CompendioTheWitcher';
const TEMP_BASE = path.join(ROOT, 'temp_images');
const ASSETS_BASE = path.join(ROOT, 'witcher-compendium', 'assets');
const WORK_LIST_PATH = path.join(ROOT, 'scratch', 'work_list.json');
const REPORT_PATH = path.join(ROOT, 'scratch', 'global_missing_icons_report.json');

// Load data
const workList = JSON.parse(fs.readFileSync(WORK_LIST_PATH, 'utf8'));
const missingReport = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));

// Flatten workList and combine with missing report for a complete mapping
const allItems = [];

// 1. Add items from workList
for (const packName in workList) {
    workList[packName].forEach(item => {
        allItems.push({
            name: item.name,
            imgPath: item.imgPath,
            filename: item.filename,
            pack: packName
        });
    });
}

// 2. Add items from missing report (if not already present)
missingReport.forEach(m => {
    const filename = path.basename(m.expected);
    const imgPath = m.expected.replace('modules/witcher-compendium/', '');
    
    // Check if we already have this filename in allItems
    if (!allItems.some(i => i.filename.toLowerCase() === filename.toLowerCase())) {
        allItems.push({
            name: m.name,
            imgPath: imgPath,
            filename: filename,
            pack: m.pack
        });
    }
});

// Folders in temp_images to check
const sourceFolders = [
    'witcher-components',
    'witcher-components-diario',
    'witcher-components-mutageni-dw',
    'witcher-dlc-ms-components',
    'witcher-mutations',
    'witcher-mutazioni-tc',
    'witcher-schematics',
    'witcher-weapons',
    'witcher-dlc-sw-schematics',
    'witcher-dlc-ts-schematics',
    'witcher-equipment',
    'witcher-special',
    'witcher-special-chaos',
    'witcher-trophies'
];

async function processImages() {
    console.log('Starting Batch 20 conversion & deployment...');
    console.log(`Total mapping entries loaded: ${allItems.length}`);
    
    for (const folder of sourceFolders) {
        const sourceDir = path.join(TEMP_BASE, folder);
        if (!fs.existsSync(sourceDir)) {
            continue;
        }

        const files = fs.readdirSync(sourceDir).filter(f => f.toLowerCase().endsWith('.png'));
        if (files.length === 0) continue;

        console.log(`\nProcessing ${files.length} files in ${folder}...`);

        for (const file of files) {
            const baseName = path.parse(file).name;
            const webpName = baseName + '.webp';
            
            // Find all matching mappings
            const matchingItems = allItems.filter(i => i.filename.toLowerCase() === webpName.toLowerCase());
            
            if (matchingItems.length === 0) {
                console.warn(`  [MISSING MAPPING] ${file}`);
                continue;
            }

            for (const item of matchingItems) {
                const sourcePath = path.join(sourceDir, file);
                const targetPath = path.join(ROOT, 'witcher-compendium', item.imgPath);
                const targetDir = path.dirname(targetPath);

                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                try {
                    await sharp(sourcePath)
                        .webp({ quality: 90, lossless: false })
                        .toFile(targetPath);
                    console.log(`  [OK] ${file} -> ${item.imgPath}`);
                } catch (err) {
                    console.error(`  [ERROR] ${file} for ${item.imgPath}:`, err.message);
                }
            }
        }
    }
    console.log('\nDeployment complete!');
}

processImages().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
