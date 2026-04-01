const fs = require('fs');
const path = require('path');

const ASSETS_PREFIX = "modules/witcher-compendium/assets/Immagini/";
const RAW_DATA_DIR = path.join(__dirname, '..', 'data');
const PACKS_DIR = path.join(__dirname, 'packs');
const IMAGES_DIR = path.join(__dirname, 'assets', 'Immagini');

// 1. Load Raw
const rawIndex = {};
const rawFiles = fs.readdirSync(RAW_DATA_DIR).filter(f => f.startsWith('raw_') && f.endsWith('.json'));
rawFiles.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(RAW_DATA_DIR, file), 'utf8'));
    data.forEach(entry => {
        if (!entry.name) return;
        const key = entry.name.toLowerCase().trim();
        if (!rawIndex[key]) rawIndex[key] = [];
        rawIndex[key].push({
            page: entry.page || entry.page_num || null,
            name: entry.name
        });
    });
});

// 2. Load Images
if (!fs.existsSync(IMAGES_DIR)) {
    console.error("IMAGES_DIR NOT FOUND: " + IMAGES_DIR);
    process.exit(1);
}
const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png'));

console.log("=== DEBUG: SPADA DI FERRO ===");
const target = "spada di ferro";
console.log("Index keys for target:", rawIndex[target]);

const metadata = rawIndex[target] ? rawIndex[target][0] : null;
if (metadata && metadata.page) {
    const pageNum = parseInt(metadata.page);
    const pageStr = pageNum.toString().padStart(3, '0');
    console.log(`Searching for Pag${pageStr}_`);
    const pageImages = imageFiles.filter(img => img.startsWith(`Pag${pageStr}_`));
    console.log(`Found ${pageImages.length} images for page ${pageNum}:`);
    console.log(pageImages.slice(0, 5));
} else {
    console.log("No metadata or page found for target.");
}

console.log("\n=== DEBUG: MAGIC INDEX ===");
const magicKeys = Object.keys(rawIndex).filter(k => k.includes("bussola"));
console.log("Magic keys:", magicKeys);
if (magicKeys.length > 0) {
    console.log("Metadata for first magic key:", rawIndex[magicKeys[0]]);
}
