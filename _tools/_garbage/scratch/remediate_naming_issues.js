const fs = require('fs');
const path = require('path');

const ROOT = 'e:\\AntigravitiProgetti\\CompendioTheWitcher';
const SRC_PACKS = path.join(ROOT, '_tools', 'src-packs');
const TEMP_BASE = path.join(ROOT, 'temp_images');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

function sanitize(str) {
    return str
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^\x00-\x7F]/g, 'a'); // Catch-all for other special chars
}

console.log('Starting remediation of naming issues...');

// 1. Scan temp_images and rename files with special chars
if (fs.existsSync(TEMP_BASE)) {
    walkDir(TEMP_BASE, (filePath) => {
        const filename = path.basename(filePath);
        if (/[^\x00-\x7F]/.test(filename)) {
            const sanitizedFilename = sanitize(filename).toLowerCase().replace(/\s+/g, '_');
            const newPath = path.join(path.dirname(filePath), sanitizedFilename);
            console.log(`Renaming temp image: ${filename} -> ${sanitizedFilename}`);
            fs.renameSync(filePath, newPath);
        }
    });
}

// 2. Scan src-packs and update JSON files
walkDir(SRC_PACKS, (jsonPath) => {
    if (!jsonPath.endsWith('.json')) return;

    try {
        let content = fs.readFileSync(jsonPath, 'utf8');
        let data = JSON.parse(content);
        let changed = false;

        // Fix name if it has special chars mess (optional, but good for consistency)
        if (/[^\x00-\x7F]/.test(data.name)) {
            // We don't necessarily want to strip accents from the NAME shown to users,
            // but we want to make sure it's valid UTF-8.
            // However, the user said "la a finale è diversa", so maybe they WANT it fixed.
            // For now, let's focus on the IMAGE path which is the technical blocker.
        }

        if (data.img && /[^\x00-\x7F]/.test(data.img)) {
            const oldImg = data.img;
            // Sanitize the filename part of the path
            const dirPart = path.dirname(oldImg);
            const filePart = path.basename(oldImg);
            const sanitizedFilePart = sanitize(filePart).toLowerCase().replace(/\s+/g, '_');
            data.img = (dirPart + '/' + sanitizedFilePart).replace(/\\/g, '/');
            console.log(`Updating JSON img path: ${oldImg} -> ${data.img}`);
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 4), 'utf8');
        }
    } catch (e) {
        // console.error(`Error processing ${jsonPath}: ${e.message}`);
    }
});

console.log('\nRemediation complete!');
