const fs = require('fs');
const path = require('path');

const baseDir = `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore`;

const updatesA = {
    "Loggia delle Maghe": "<p>La Loggia delle Maghe fu fondata segretamente da Philippa Eilhart, ex-consigliera e reggente di Redania, con lo scopo di salvaguardare gli interessi della magia dopo gli eventi che avevano intaccato il prestigio degli incantatori. A differenza delle organizzazioni precedenti, operava nell'ombra. Tra le sue membri figuravano Sile de Tancarville e Fringilla Vigo, quest'ultima appartenente all'Impero Nilfgaardiano nonostante le tensioni politiche. All'incontro di Loc Muinne si scoprì che la Loggia aveva assoldato Letho, witcher della Scuola della Vipera, per assassinare i sovrani del Nord che non si piegavano ai desideri dei maghi. Il piano portò all'eliminazione di Re Demawend di Aedirn e Re Foltest di Temeria, e alla definitiva distruzione della Loggia stessa.</p>",
    "Scuola della Manticora": "<p>Sesta scuola di witcher di cui si hanno solo notizie frammentarie. Secondo il mercante Rodolf Kazmer, che riporta le parole di un viaggiatore, la scuola si troverebbe oltre il deserto del Korath, in una terra lontana dall'Est. I pochi witcher incontrati provenienti da questa scuola sono descritti come pericolosi vagabondi.</p>",
    "Luoghi di Potere": "<p>I luoghi di potere sono potenti rovine magiche lasciate da antichi stregoni elfici, costruite su incroci magici. Quando una persona ricettiva alla magia trascorre tre turni a concentrarsi in un luogo di potere, riceve un bonus temporaneo basato sull'elemento legato al posto. Guadagna inoltre 10 PI utilizzabili esclusivamente per apprendere nuove magie o aumentare le abilità legate alla magia. In alternativa, un invocatore può rinunciare a questo bonus per estrarre 5 unità di Quintessenza. I luoghi di potere sono molto rari e si possono reperire solo dove l'elemento associato è particolarmente forte.</p>"
};

const updatesB = ["Niya (Lilit)", "San Gregory", "Valle del Pontar"];

let report = [];

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.json'));

files.forEach(f => {
    const fullPath = path.join(baseDir, f);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const name = data.name;

    if (updatesA[name]) {
        if (!data.system) data.system = {};
        data.system.description = updatesA[name];
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), 'utf8');
        report.push(`[witcher-lore] [${name}] — STATO: Aggiornato`);
    } else if (updatesB.includes(name)) {
        if (!data.system) data.system = {};
        if (data.system.description) {
           data.system.description = data.system.description + " <!-- NON VERIFICATO -->";
        } else {
           data.system.description = "<!-- NON VERIFICATO -->";
        }
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), 'utf8');
        report.push(`[witcher-lore] [${name}] — STATO: Tag aggiunto`);
    }
});

fs.writeFileSync('e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\update_report_2.txt', report.join('\n'), 'utf8');
