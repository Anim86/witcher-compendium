const fs = require('fs');
const path = require('path');

const ROOT = 'e:\\AntigravitiProgetti\\CompendioTheWitcher';
const SRC_PACKS = path.join(ROOT, '_tools', 'src-packs');
const ASSETS_BASE = path.join(ROOT, 'witcher-compendium', 'assets');
const TEMP_BASE = path.join(ROOT, 'temp_images');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

const issues = [];

console.log('Scanning packs for naming discrepancies...');

walkDir(SRC_PACKS, (jsonPath) => {
    if (!jsonPath.endsWith('.json')) return;

    try {
        const content = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(content);
        const name = data.name;
        const img = data.img;

        if (!img || img.includes('icons/svg')) return;

        const imgFilename = path.basename(img);
        const imgNameNoExt = imgFilename.replace('.webp', '');

        // Basic sanitization of name for comparison
        // Replace spaces with underscores, lower case, remove accents
        const sanitizedName = name.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9_]/g, '');

        const sanitizedImgName = imgNameNoExt.toLowerCase()
            .replace(/[^a-z0-9_]/g, '');

        // If the sanitized name doesn't match the sanitized image name, or if there are special chars in image name
        const hasSpecialCharsInImg = /[^\x00-\x7F]/.test(imgFilename);
        const namesMismatch = sanitizedName !== sanitizedImgName && !sanitizedImgName.includes(sanitizedName) && !sanitizedName.includes(sanitizedImgName);

        if (hasSpecialCharsInImg || namesMismatch) {
            issues.push({
                pack: path.relative(SRC_PACKS, jsonPath),
                itemName: name,
                imgValue: img,
                imgFilename: imgFilename,
                reason: hasSpecialCharsInImg ? 'Special chars in filename' : 'Name/Img mismatch'
            });
        }
    } catch (e) {
        // console.error(`Error processing ${jsonPath}: ${e.message}`);
    }
});

console.log(`Found ${issues.length} potential issues.\n`);

issues.forEach(issue => {
    console.log(`Pack: ${issue.pack}`);
    console.log(`  Name: ${issue.itemName}`);
    console.log(`  Img:  ${issue.imgValue}`);
    console.log(`  Reason: ${issue.reason}`);
    console.log('---');
});

// Save to a report
fs.writeFileSync(path.join(ROOT, 'scratch', 'naming_issues_report.json'), JSON.stringify(issues, null, 4));
console.log(`Report saved to scratch/naming_issues_report.json`);
