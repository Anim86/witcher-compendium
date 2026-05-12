const fs = require('fs');
const path = require('path');

const manualDirs = [
    'e:\\AntigravitiProgetti\\CompendioTheWitcher\\Manuali\\Witcher-v1.3_Estrazione\\Testi',
    'e:\\AntigravitiProgetti\\CompendioTheWitcher\\Manuali\\the-witcher-tomo-del-caos_Estrazione\\Testi',
    'e:\\AntigravitiProgetti\\CompendioTheWitcher\\Manuali\\Witcher - Libro dei Racconti (italian)_Estrazione\\Testi',
    'e:\\AntigravitiProgetti\\CompendioTheWitcher\\Manuali\\DLC\\The-Witcher-DLC-Locande-e-Taverne_Estrazione\\Testi',
    'e:\\AntigravitiProgetti\\CompendioTheWitcher\\Manuali\\DLC\\The-Witcher-DLC-Carri-e-Viaggi_Estrazione\\Testi'
];

let availableTxts = [];
manualDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
        files.forEach(f => availableTxts.push({ file: f, path: path.join(dir, f), dir }));
    }
});

const baseDir = `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti`;
const packs = ['witcher-lore', 'witcher-lore-chaos', 'witcher-lore-racconti', 'witcher-dlc-sr-lore'];

packs.forEach(p => {
    const dirPath = path.join(baseDir, p);
    if (!fs.existsSync(dirPath)) return;
    const jsonFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    
    jsonFiles.forEach(jf => {
        const data = JSON.parse(fs.readFileSync(path.join(dirPath, jf), 'utf8'));
        const name = data.name;
        
        // Find best match in availableTxts
        const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matches = availableTxts.filter(txt => {
            const txtNormalized = txt.file.toLowerCase().replace(/[^a-z0-9]/g, '');
            return txtNormalized.includes(normalizedName);
        });
        
        if (matches.length > 0) {
            console.log(`[FOUND] ${name} -> ${matches[0].file}`);
        } else {
            console.log(`[MISSING] ${name}`);
        }
    });
});
