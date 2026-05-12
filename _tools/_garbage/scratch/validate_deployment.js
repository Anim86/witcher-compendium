const fs = require('fs');
const path = require('path');

const ROOT = 'e:\\AntigravitiProgetti\\CompendioTheWitcher';
const TEMP_BASE = path.join(ROOT, 'temp_images');
const ASSETS_BASE = path.join(ROOT, 'witcher-compendium', 'assets');
const WORK_LIST_PATH = path.join(ROOT, 'scratch', 'work_list.json');

const workList = JSON.parse(fs.readFileSync(WORK_LIST_PATH, 'utf8'));
const allItems = [];
for (const packName in workList) {
    workList[packName].forEach(item => {
        allItems.push({ ...item, pack: packName });
    });
}

const sourceFolders = [
    'witcher-equipment',
    'witcher-special',
    'witcher-special-chaos'
];

console.log('Validating deployment of generated icons...');

const report = {
    deployed: [],
    missingMapping: [],
    failedDeployment: []
};

sourceFolders.forEach(folder => {
    const sourceDir = path.join(TEMP_BASE, folder);
    if (!fs.existsSync(sourceDir)) return;

    const files = fs.readdirSync(sourceDir).filter(f => f.toLowerCase().endsWith('.png'));
    
    files.forEach(file => {
        const webpName = path.parse(file).name + '.webp';
        const mappings = allItems.filter(i => i.filename.toLowerCase() === webpName.toLowerCase());
        
        if (mappings.length === 0) {
            report.missingMapping.push({ file, folder });
            return;
        }

        mappings.forEach(item => {
            const targetPath = path.join(ROOT, 'witcher-compendium', item.imgPath);
            if (fs.existsSync(targetPath)) {
                report.deployed.push({ file, target: item.imgPath });
            } else {
                report.failedDeployment.push({ file, target: item.imgPath });
            }
        });
    });
});

console.log(`\nValidation Summary:`);
console.log(`- Successfully deployed: ${report.deployed.length}`);
console.log(`- Missing mapping in work_list: ${report.missingMapping.length}`);
console.log(`- Mapping exists but file not in assets: ${report.failedDeployment.length}`);

if (report.missingMapping.length > 0) {
    console.log('\nMissing Mappings:');
    report.missingMapping.forEach(m => console.log(`  [${m.folder}] ${m.file}`));
}

if (report.failedDeployment.length > 0) {
    console.log('\nFailed Deployments:');
    report.failedDeployment.forEach(f => console.log(`  ${f.file} -> ${f.target}`));
}

fs.writeFileSync(path.join(ROOT, 'scratch', 'deployment_validation_report.json'), JSON.stringify(report, null, 4));
