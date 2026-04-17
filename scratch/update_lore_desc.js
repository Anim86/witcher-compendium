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
        files.forEach(f => availableTxts.push({ file: f, path: path.join(dir, f) }));
    }
});

const baseDir = `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti`;
const packs = ['witcher-lore', 'witcher-lore-chaos', 'witcher-lore-racconti', 'witcher-dlc-sr-lore'];

let report = [];

packs.forEach(p => {
    const dirPath = path.join(baseDir, p);
    if (!fs.existsSync(dirPath)) return;
    const jsonFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    
    jsonFiles.forEach(jf => {
        const fullPath = path.join(dirPath, jf);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const name = data.name;
        
        let manualCode = "MB / TC / LR / DLC";
        if (data.system && data.system.sourcebook) {
            const rawSource = data.system.sourcebook;
            if (rawSource.startsWith("MB")) manualCode = "MB";
            else if (rawSource.startsWith("TC")) manualCode = "TC";
            else if (rawSource.startsWith("LR")) manualCode = "LR";
            else if (rawSource.includes("Locande e Taverne") || rawSource.includes("Carri e Viaggi")) manualCode = "DLC";
        }
        
        const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matches = availableTxts.filter(txt => {
            const txtNormalized = txt.file.toLowerCase().replace(/[^a-z0-9]/g, '');
            return txtNormalized.includes(normalizedName);
        });
        
        if (matches.length > 0) {
            // Usa il primo match (unico possibile in gran parte dei casi)
            const txtContent = fs.readFileSync(matches[0].path, 'utf8').replace(/\r\n/g, '\n');
            const currentDesc = (data.system && data.system.description) ? data.system.description.replace(/\r\n/g, '\n') : '';
            
            if (currentDesc === txtContent) {
                report.push(`[${p}] [${name}] — STATO: Già conforme`);
            } else {
                data.system.description = txtContent;
                fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), 'utf8');
                report.push(`[${p}] [${name}] — STATO: Aggiornato`);
            }
        } else {
            report.push(`[${p}] [${name}] — STATO: Testo sorgente non trovato \n   -> Query NotebookLM: "In quale sezione o pagina del manuale ${manualCode} si trovano le informazioni su ${name}?"`);
        }
    });
});

fs.writeFileSync('e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\update_report.txt', report.join('\n'), 'utf8');
