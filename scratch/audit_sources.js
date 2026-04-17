const fs = require('fs');
const path = require('path');

const baseDir = `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti`;
const dirs = [
    'witcher-lore',
    'witcher-lore-chaos',
    'witcher-lore-racconti'
];

let report = [];

dirs.forEach(d => {
    const dirPath = path.join(baseDir, d);
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    
    report.push(`\n=== Pack: ${d} ===`);
    files.forEach(f => {
        const fullPath = path.join(dirPath, f);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const name = data.name || '???';
        const source = (data.system && data.system.sourcebook) ? data.system.sourcebook : 'MANCANTE';
        report.push(`- ${name}: "${source}"`);
    });
});

fs.writeFileSync('e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\sources_report.txt', report.join('\n'), 'utf8');
