const fs = require('fs');
const path = require('path');

const ROOT = 'e:\\AntigravitiProgetti\\CompendioTheWitcher';
const SRC_PACKS = path.join(ROOT, '_tools', 'src-packs');
const ASSETS_BASE = path.join(ROOT, 'witcher-compendium', 'assets');
const TEMP_BASE = path.join(ROOT, 'temp_images');

const results = {
    found: 0,
    missing: [],
    placeholders: 0 // Default icons like 'icons/svg/item-bag.svg'
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

console.log('Starting global icon audit...');

// Pre-scan temp_images to see what we have there (as PNG or WebP)
const tempFiles = new Set();
if (fs.existsSync(TEMP_BASE)) {
    walkDir(TEMP_BASE, (filePath) => {
        tempFiles.add(path.basename(filePath).toLowerCase());
    });
}

walkDir(SRC_PACKS, (jsonPath) => {
    if (!jsonPath.endsWith('.json')) return;

    try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const imgPath = data.img;

        if (!imgPath || imgPath.includes('icons/svg') || imgPath.includes('icons/mystery-man')) {
            results.placeholders++;
            results.missing.push({
                name: data.name,
                pack: path.relative(SRC_PACKS, path.dirname(jsonPath)),
                reason: 'Placeholder / No image'
            });
            return;
        }

        // Resolve Foundry path to local path
        // modules/witcher-compendium/assets/... -> e:/.../assets/...
        const localPath = imgPath.replace('modules/witcher-compendium/assets/', ASSETS_BASE + path.sep).replace(/\//g, path.sep);
        
        const existsInAssets = fs.existsSync(localPath);
        const filename = path.basename(localPath).toLowerCase();
        const pngFilename = filename.replace('.webp', '.png');
        const existsInTemp = tempFiles.has(filename) || tempFiles.has(pngFilename);

        if (!existsInAssets && !existsInTemp) {
            results.missing.push({
                name: data.name,
                pack: path.relative(SRC_PACKS, path.dirname(jsonPath)),
                reason: 'File not found',
                expected: imgPath
            });
        } else {
            results.found++;
        }
    } catch (e) {
        console.error(`Error processing ${jsonPath}: ${e.message}`);
    }
});

console.log(`\nAudit Results:`);
console.log(`Total items with valid icons: ${results.found}`);
console.log(`Total missing items: ${results.missing.length}`);
console.log(`(of which ${results.placeholders} are placeholders/SVG)`);

// Save report
const reportPath = path.join(ROOT, 'scratch', 'global_missing_icons_report.json');
fs.writeFileSync(reportPath, JSON.stringify(results.missing, null, 4));
console.log(`\nDetailed report saved to: ${reportPath}`);

// Group by pack for readability
const summaryByPack = {};
results.missing.forEach(m => {
    summaryByPack[m.pack] = (summaryByPack[m.pack] || 0) + 1;
});

console.log('\nMissing items per pack:');
Object.entries(summaryByPack).sort((a,b) => b[1] - a[1]).forEach(([pack, count]) => {
    console.log(`- ${pack}: ${count}`);
});
