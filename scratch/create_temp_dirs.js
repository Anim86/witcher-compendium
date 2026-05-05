const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync('scratch/global_missing_icons_report.json', 'utf8'));

const uniquePacks = [...new Set(report.map(item => {
    // split by either \ or / to be safe
    const parts = item.pack.split(/[\/\\]/);
    return parts[parts.length - 1];
}))];

uniquePacks.forEach(packName => {
    const dir = path.join('temp_images', packName);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log('Created ' + dir);
    }
});

console.log('All necessary directories created in temp_images/');
