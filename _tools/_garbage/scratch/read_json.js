const fs = require('fs');
const path = require('path');

const baseDir = `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore`;

const targetFiles = [
    'niya_lilit_9e67876a3b2b4bc6.json',
    'san_gregory_f3c8de8121f009e4.json', // Adjust paths if necessary, I will just list and match substring
];

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.json'));

let output = [];

files.forEach(f => {
    if (f.includes('niya_lilit') || f.includes('san_gregory') || f.includes('valle_del_pontar')) {
        const fullPath = path.join(baseDir, f);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        output.push(`=== ${data.name} ===`);
        output.push(data.system.description ? data.system.description : "[CAMPO VUOTO]");
        output.push(`-----------------------`);
    }
});

fs.writeFileSync('e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\read_json.txt', output.join('\n'), 'utf8');
