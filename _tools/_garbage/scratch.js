const fs = require('fs');
const path = require('path');

const spellsDir = '_tools/src-packs/MAGIA/witcher-spells';

const spellMapping = {
    "mixed": [
        "bussola magica", "dissipazione", "evoca bordone", "fascino", "manipolazione mentale", "polvere accecante", "specchio di afan", "telepatia",
        "illusione", "tecnica di eilhart", "teletrasporto",
        "comando mentale", "portale"
    ],
    "earth": [
        "cenlly graig", "codi bywyd", "guarigione magica", "incantesimo diagnostico", "penna di luthien", "prigione di talfryn", "soffio di korath", "soffio del korath", "spuntone di terra",
        "rhwystr graig", "teoria di elgan", "terremoto di stammelford",
        "polimorfismo", "trasmutazione"
    ],
    "air": [
        "adenydd", "arieggiare", "folata di bronwyn", "riparo di urien", "sacca d'aria", "telecinesi", "tempesta statica", "zefiro",
        "gwynt troelli", "soffocare", "tuono di alzur",
        "derviscio", "tempesta di fulmini"
    ],
    "fire": [
        "aenye", "aine verseos", "alzare le fiamme", "fiammata", "lampo magico", "marchio a fuoco", "stretta di cadfan", "tanio ilchar",
        "moto di demetia crest", "seirff haul", "vortice fiammeggiante",
        "effetto specchio", "fuoco di maelgar"
    ],
    "water": [
        "acquazzone", "controllare acque", "grandinata di carys", "lastra di ghiaccio", "maledizione di sedna", "nebbia di dormyn", "puro dwr", "rhewi",
        "anialwch", "grandine di merigold", "ondate della naglfar",
        "dividere le acque", "tryferi gaeaf"
    ]
};

const errors = [];

const files = fs.readdirSync(spellsDir);
for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(spellsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.type !== 'spell') continue;
    if (data.system.class !== 'Mage') continue;

    const name = data.name.toLowerCase().trim();
    const currentSource = data.system.source; 
    
    let expectedSource = null;
    for (const [source, list] of Object.entries(spellMapping)) {
        if (list.includes(name)) {
            expectedSource = source;
            break;
        }
    }
    
    if (expectedSource && expectedSource !== currentSource) {
        errors.push(`${data.name} (${file}): is ${currentSource}, should be ${expectedSource}`);
    } else if (!expectedSource) {
        errors.push(`${data.name} (${file}): Non trovato nel mapping`);
    }
}

console.log(errors.length > 0 ? errors.join('\n') : "Tutto corretto!");
