import fs from 'fs';
import path from 'path';

// Paths
const BRAIN_DIR = 'C:/Users/Manuel/.gemini/antigravity/brain/fc0cb6de-acf2-458a-99b6-170555c63882';
const TEMP_DIR = 'e:/AntigravitiProgetti/CompendioTheWitcher/temp_images';

// Mapping
const mapping = {
    "anti_bestie_obj": "Anti-Bestie.png",
    "anti_necrofagi_obj": "Anti-Necrofagi.png"
};

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const files = fs.readdirSync(BRAIN_DIR);

for (const [prefix, targetName] of Object.entries(mapping)) {
    const matchingFiles = files.filter(f => f.startsWith(prefix) && f.endsWith('.png'));
    if (matchingFiles.length > 0) {
        matchingFiles.sort((a, b) => {
            return fs.statSync(path.join(BRAIN_DIR, b)).mtimeMs - fs.statSync(path.join(BRAIN_DIR, a)).mtimeMs;
        });
        const src = path.join(BRAIN_DIR, matchingFiles[0]);
        const dest = path.join(TEMP_DIR, targetName);
        fs.copyFileSync(src, dest);
        console.log(`Copied ${matchingFiles[0]} to ${targetName}`);
    }
}
