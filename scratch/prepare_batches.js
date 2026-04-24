const fs = require('fs');
const path = require('path');

const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/global_missing_icons_report.json';
const missing = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const groups = {};
missing.forEach(m => {
    groups[m.pack] = (groups[m.pack] || []);
    groups[m.pack].push(m);
});

console.log('Missing items per pack:');
for (const pack in groups) {
    console.log(`${pack}: ${groups[pack].length}`);
}

// Select items for the next few batches (21, 22, 23)
// Priority: Components, Mutagens, Schematics
const priorityPacks = [
    'ALCHIMIA_E_ARTIGIANATO\\Componenti\\witcher-components',
    'ALCHIMIA_E_ARTIGIANATO\\Componenti\\witcher-components-diario',
    'ALCHIMIA_E_ARTIGIANATO\\Componenti\\witcher-components-mutageni-dw',
    'ALCHIMIA_E_ARTIGIANATO\\Componenti\\witcher-dlc-ms-components',
    'ALCHIMIA_E_ARTIGIANATO\\Mutageni\\witcher-mutations',
    'ALCHIMIA_E_ARTIGIANATO\\Mutageni\\witcher-mutazioni-tc'
];

let selectedItems = [];
priorityPacks.forEach(pack => {
    if (groups[pack]) {
        selectedItems = selectedItems.concat(groups[pack]);
    }
});

console.log(`\nTotal items in priority packs: ${selectedItems.length}`);

// Split into batches of 15
const BATCH_SIZE = 15;
for (let i = 0; i < Math.ceil(selectedItems.length / BATCH_SIZE) && i < 3; i++) {
    const batch = selectedItems.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    console.log(`\nBatch ${21 + i} (${batch.length} items):`);
    batch.forEach(item => {
        console.log(`- ${item.name} (${item.pack})`);
    });
}
