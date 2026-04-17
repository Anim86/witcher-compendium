import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const existingNamesList = JSON.parse(fs.readFileSync('scratch/existing_names.json', 'utf8'));
const existingNames = new Set(existingNamesList.map(n => n.toLowerCase().trim()));

function mkDirSafe(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function logDuplicate(name, dlc) {
    fs.appendFileSync('duplicates-dlc.log', `[SKIP] ${name} (DLC: ${dlc}) - Already exists in core/main packs.\n`, 'utf8');
}

function saveJson(dir, name, desc, sb, type = 'item') {
    const lowerName = name.toLowerCase().trim();
    if (existingNames.has(lowerName)) {
        logDuplicate(name, sb);
        return;
    }

    const id = crypto.randomBytes(8).toString('hex');
    const safe = name.replace(/[^a-zA-Z0-9À-ÿ_]/g, '_').replace(/__+/g, '_').toLowerCase();
    const filePath = path.join(dir, `${safe}_${id}.json`);
    
    let foundryType = 'item';
    if (type === 'npc' || type === 'monster') foundryType = 'npc';
    
    const doc = {
        _id: id,
        name,
        type: foundryType,
        img: `modules/witcher-compendium/assets/placeholder.webp`,
        system: {
            description: `<p>${desc}</p>`,
            sourcebook: sb
        },
        effects: [], flags: {},
        _stats: { systemId: 'TheWitcherItaNewSystem', coreVersion: 14 }
    };
    
    fs.writeFileSync(filePath, JSON.stringify(doc, null, 4), 'utf8');
    console.log('✓', name);
    existingNames.add(lowerName);
}

// ─────────────────────────────────────────────────────────
// SR: SULLA STRADA (Carri + Locande)
// ─────────────────────────────────────────────────────────
const dirSrEq = '_tools/src-packs/DLC/carri-e-viaggi/witcher-dlc-sr-equipment';
const dirSrLore = '_tools/src-packs/DLC/carri-e-viaggi/witcher-dlc-sr-lore';
mkDirSafe(dirSrEq); mkDirSafe(dirSrLore);

const itemsSR = [
    { name: 'Carro Base', desc: 'Carro standard per il trasporto di merci e passeggeri lungo le rotte commerciali.' },
    { name: 'Carro di Qualità', desc: 'Carro costruito con legname pregiato e sospensioni rinforzate per una maggiore durata.' },
    { name: 'Carro d\'Appoggio', desc: 'Carro leggero e veloce, ideale per seguire spedizioni o eserciti.' },
    { name: 'Carro da Guerra', desc: 'Pesantemente corazzato e dotato di feritoie, progettato per il trasporto in zone di conflitto.' },
    { name: 'Assali Rinforzati', desc: 'Miglioria per carri: riduce la probabilità di rottura del carro su terreni accidentati.' },
    { name: 'Ruote di Scorta', desc: 'Essenziali per ogni lungo viaggio. Permettono riparazioni rapide in strada.' },
    { name: 'Cinghie da Carico', desc: 'Miglioria per carri: permette di fissare meglio il carico, aumentando la capacità effettiva.' },
    { name: 'Lanterne da Carro', desc: 'Coppia di lanterne fisse per illuminare la strada durante i viaggi notturni.' },
    { name: 'Compartimento Segreto', desc: 'Miglioria per carri: vano nascosto per il contrabbando o la protezione di oggetti preziosi.' }
];
itemsSR.forEach(i => saveJson(dirSrEq, i.name, i.desc, 'SR'));

const loreSR = [
    { name: 'Strade e Distanze del Continente', desc: 'Informazioni dettagliate sulle principali tratte commerciali e le distanze tra le città del Nord e di Nilfgaard.' },
    { name: 'Tipi di Locali e Taverne', desc: 'Guida alle diverse tipologie di locande presenti nel Continente, dai bordelli alle taverne di lusso.' },
    { name: 'Peculiarità delle Locande', desc: 'Tabella delle caratteristiche distintive che possono rendere unica una locanda o una taverna.' },
    { name: 'Locanda La Spada Canterina', desc: 'Esempio dettagliato di una locanda tipica, con mappa ideale e atmosfera suggerita.' }
];
loreSR.forEach(l => saveJson(dirSrLore, l.name, l.desc, 'SR'));

// ─────────────────────────────────────────────────────────
// SL: SCUOLA DELLA LUMACA (Non Canonico)
// ─────────────────────────────────────────────────────────
const dirSlEq = '_tools/src-packs/DLC/scuola-lumaca/witcher-dlc-sl-equipment';
const dirSlSch = '_tools/src-packs/DLC/scuola-lumaca/witcher-dlc-sl-schematics';
mkDirSafe(dirSlEq); mkDirSafe(dirSlSch);

const itemsSL = [
    { name: 'Spada d\'Acciaio della Lumaca', desc: 'Spada abnorme e pesante, forgiata (secondo la leggenda) dagli assali di un carro. Infligge danni massicci.' },
    { name: 'Spada d\'Argento della Lumaca', desc: 'Spada d\'argento pesante e grezza, adatta a chi preferisce la forza bruta alla grazia.' },
    { name: 'Armatura della Lumaca', desc: 'Armatura pesante (Protezione 30) realizzata con pentole, padelle e rottami. Estremamente protettiva ma lentissima.' },
    { name: 'Capacità: Muco', desc: 'Capacità speciale della Scuola della Lumaca. Una sudorazione viscosa che rende difficile afferrare il witcher.' }
];
itemsSL.forEach(i => saveJson(dirSlEq, i.name, i.desc, 'SL'));

const schSL = [
    { name: 'Schema Spada d\'Acciaio della Lumaca', desc: 'Schema maestro per forgiare la mastodontica spada d\'acciaio lumaca.' },
    { name: 'Schema Spada d\'Argento della Lumaca', desc: 'Schema maestro per forgiare la spada d\'argento lumaca.' },
    { name: 'Schema Armatura della Lumaca', desc: 'Schema per assemblare l\'armatura pesante di rottami della scuola.' }
];
schSL.forEach(s => saveJson(dirSlSch, s.name, s.desc, 'SL'));

const loreSL = [
    { name: 'Elias von Drexel', desc: 'Autore poliedrico e studioso di "conoscenze perdute", tra cui la leggenda della Scuola della Lumaca.' },
    { name: 'Broderick il Bisteccone', desc: 'Fondatore della Scuola della Lumaca. Un gigante goffo ma determinato, sopravvissuto a mutazioni difettose.' }
];
// Note: Generating these AS PNG/NPC as per pattern or valuable items? I'll use NPC for now as they are named characters.
loreSL.forEach(l => saveJson(dirSlEq, l.name, l.desc, 'SL', 'npc'));

console.log('Batch 3 complete.');
