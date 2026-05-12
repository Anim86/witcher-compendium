const fs = require('fs');
const path = require('path');

const ROOT = 'e:\\AntigravitiProgetti\\CompendioTheWitcher';
const SRC_PACKS = path.join(ROOT, '_tools', 'src-packs');
const WORK_LIST_PATH = path.join(ROOT, 'scratch', 'work_list.json');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

const newWorkList = {};

console.log('Synchronizing work_list.json from packs...');

walkDir(SRC_PACKS, (jsonPath) => {
    if (!jsonPath.endsWith('.json')) return;

    try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const packName = path.relative(SRC_PACKS, path.dirname(jsonPath));
        
        if (!data.img || data.img.includes('icons/svg')) return;

        if (!newWorkList[packName]) newWorkList[packName] = [];
        
        newWorkList[packName].push({
            name: data.name,
            imgPath: data.img.replace('modules/witcher-compendium/', ''),
            filename: path.basename(data.img)
        });
    } catch (e) {
        // console.error(`Error processing ${jsonPath}: ${e.message}`);
    }
});

fs.writeFileSync(WORK_LIST_PATH, JSON.stringify(newWorkList, null, 4), 'utf8');
console.log('work_list.json synchronized successfully!');
