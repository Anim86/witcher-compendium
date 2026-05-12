const fs = require('fs');
const data = JSON.parse(fs.readFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json', 'utf8'));

const results = [];
for (const [packName, items] of Object.entries(data)) {
    items.forEach(item => {
        if (item.name.length <= 6) {
            results.push({ pack: packName, name: item.name });
        }
    });
}
console.log(JSON.stringify(results, null, 2));
