const fs = require('fs');
const data = JSON.parse(fs.readFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json', 'utf8'));

const duplicates = [];
for (const [packName, items] of Object.entries(data)) {
    const names = new Set();
    items.forEach(item => {
        const normalizedName = item.name.toLowerCase().trim();
        if (names.has(normalizedName)) {
            duplicates.push({ pack: packName, name: item.name });
        } else {
            names.add(normalizedName);
        }
    });
}
console.log(JSON.stringify(duplicates, null, 2));
