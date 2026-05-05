const fs = require('fs');
const report = JSON.parse(fs.readFileSync('scratch/global_missing_icons_report.json', 'utf8'));

const problematic = report.filter(item => {
    const filename = item.expected ? item.expected : item.name;
    return /[\(\)\"\']/.test(filename);
});

console.log(`Found ${problematic.length} problematic items out of ${report.length}`);
problematic.slice(0, 20).forEach(item => {
    console.log(`- Name: ${item.name} | Expected: ${item.expected}`);
});
