const fs = require('fs');
const path = require('path');

const baseDirs = [
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore`,
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore-chaos`,
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore-racconti`,
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-dlc-sr-lore`
];

let names = [];

baseDirs.forEach(baseDir => {
    if (!fs.existsSync(baseDir)) return;
    const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.json'));
    files.forEach(f => {
        const fullPath = path.join(baseDir, f);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        names.push(data.name);
    });
});

console.log(names.sort().join('\n'));
