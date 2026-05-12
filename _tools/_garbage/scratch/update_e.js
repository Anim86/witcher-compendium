const fs = require('fs');
const path = require('path');

const baseDirs = [
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore`,
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore-chaos`,
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore-racconti`,
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-dlc-sr-lore`
];

const updates = {
    "Società delle Maghe dell'Alto Monte": "<p>Louise van Adelaide è la volitiva leader della neonata Società delle Maghe dell'Alto Monte. In quest'epoca di pericoli per gli studiosi di magia, ha visto amici messi al rogo e molti altri isolarsi per salvarsi la vita. Estroversa per natura, Louise non era d'accordo e ha fondato la Società per rivivere i giorni di quando studiava ad Aretuza. Ha la tendenza ad agire in modo sfacciato ed è perfezionista e testarda fino a mettersi nei guai. Le sue colleghe della Società considerano quest'ultimo il tratto più distintivo di Louise, che a volte è frustrata dal continuo tentare di attenersi agli standard che lei stessa si è creata.</p>",
    "Societa delle Maghe dell Alto Monte": "<p>Louise van Adelaide è la volitiva leader della neonata Società delle Maghe dell'Alto Monte. In quest'epoca di pericoli per gli studiosi di magia, ha visto amici messi al rogo e molti altri isolarsi per salvarsi la vita. Estroversa per natura, Louise non era d'accordo e ha fondato la Società per rivivere i giorni di quando studiava ad Aretuza. Ha la tendenza ad agire in modo sfacciato ed è perfezionista e testarda fino a mettersi nei guai. Le sue colleghe della Società considerano quest'ultimo il tratto più distintivo di Louise, che a volte è frustrata dal continuo tentare di attenersi agli standard che lei stessa si è creata.</p>",
    "Glossario Dialetto Skellige": "<p>Glossario del dialetto parlato nelle isole Skellige.</p><table><tr><th>Skellige</th><th>Traduzione</th></tr><tr><td>Aep</td><td>Di</td></tr><tr><td>Ard</td><td>Alto</td></tr><tr><td>Arse</td><td>Culo</td></tr><tr><td>Bloed</td><td>Sangue</td></tr><tr><td>Blota</td><td>Umido</td></tr><tr><td>Cuach</td><td>Pazzo</td></tr><tr><td>Dottir</td><td>Figlia</td></tr><tr><td>Drakkar</td><td>Nave Lunga</td></tr><tr><td>Geas</td><td>Voto/Maledizione</td></tr><tr><td>Glaeddyy</td><td>Spada</td></tr><tr><td>Himmel</td><td>Cielo</td></tr><tr><td>Kaarl</td><td>Uomo</td></tr><tr><td>Kaer</td><td>Castello</td></tr><tr><td>Konung</td><td>Re</td></tr><tr><td>Krig</td><td>Guerra</td></tr><tr><td>Lagman</td><td>Capo/Giudice</td></tr><tr><td>Lionors</td><td>Leonessa</td></tr><tr><td>Me</td><td>Mio</td></tr><tr><td>Modron</td><td>Madre</td></tr><tr><td>Muire</td><td>Mare</td></tr><tr><td>Mylla</td><td>Suolo</td></tr><tr><td>Nagl</td><td>Unghia</td></tr><tr><td>Och</td><td>E</td></tr><tr><td>Op</td><td>Su</td></tr><tr><td>Rhena</td><td>Regina</td></tr><tr><td>Skjald</td><td>Skald</td></tr><tr><td>Skugga</td><td>Ombra</td></tr><tr><td>Svarm</td><td>Sciamare</td></tr><tr><td>Sverd</td><td>Spada</td></tr><tr><td>Tirth</td><td>Cinghiale Selvatico</td></tr><tr><td>Trall</td><td>Schiavo/Prigioniero</td></tr><tr><td>Trold</td><td>Troll</td></tr><tr><td>Vild</td><td>Selvatico</td></tr><tr><td>Zvaere</td><td>Promettere</td></tr></table>"
};

let report = [];

baseDirs.forEach(baseDir => {
    if (!fs.existsSync(baseDir)) return;
    const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.json'));
    
    files.forEach(f => {
        const fullPath = path.join(baseDir, f);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const name = data.name;
    
        if (updates[name]) {
            if (!data.system) data.system = {};
            data.system.description = updates[name];
            fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), 'utf8');
            const packName = path.basename(baseDir);
            report.push(`[${packName}] [${name}] — STATO: Aggiornato`);
        }
    });
});

fs.writeFileSync('e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\update_report_5.txt', report.join('\n'), 'utf8');
