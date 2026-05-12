const fs = require('fs');
const content = fs.readFileSync('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/inventory_equip.csv', 'utf8');
const lines = content.split('\n').slice(1);
const sources = new Set();
lines.forEach(l => {
    const match = l.match(/"([^"]*)","([^"]*)","([^"]*)","([^"]*)"/);
    if (match) sources.add(match[2]);
});
console.log(Array.from(sources).sort());
