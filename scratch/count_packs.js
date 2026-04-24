const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json', 'utf8'));
    const stats = {};
    for (let key in data) {
        stats[key] = data[key].length;
    }
    console.log(JSON.stringify(stats, null, 2));
} catch (e) {
    console.error(e);
}
