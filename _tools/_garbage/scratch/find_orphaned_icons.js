const fs = require('fs');
const path = require('path');
const workList = JSON.parse(fs.readFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json', 'utf8'));

// Build a set of all expected filenames in work_list
const expectedFilenames = new Set();
for (const packKey in workList) {
    workList[packKey].forEach(item => {
        // We look for both the filename and the png version
        expectedFilenames.add(item.filename.replace('.webp', '.png').toLowerCase());
    });
}

// Read current icons list (from the file I just created)
const currentIcons = fs.readFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/existing_icons_list.txt', 'utf8')
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.endsWith('.png'));

const orphans = [];
currentIcons.forEach(fullPath => {
    const filename = path.basename(fullPath).toLowerCase();
    if (!expectedFilenames.has(filename)) {
        orphans.push(fullPath);
    }
});

console.log("Orphaned Icons identified:");
console.log(JSON.stringify(orphans, null, 2));
