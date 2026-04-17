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

function saveJson(dir, name, desc, sb, type = 'item', packLabel = '') {
    const lowerName = name.toLowerCase().trim();
    if (existingNames.has(lowerName)) {
        logDuplicate(name, sb);
        return;
    }

    const id = crypto.randomBytes(8).toString('hex');
    const safe = name.replace(/[^a-zA-Z0-9À-ÿ_]/g, '_').replace(/__+/g, '_').toLowerCase();
    const filePath = path.join(dir, `${safe}_${id}.json`);
    
    // Normalize type for Foundry
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
    existingNames.add(lowerName); // Add to local set to avoid duplicates within same batch
}

// ─────────────────────────────────────────────────────────
// SW: SCUOLE WITCHER
// ─────────────────────────────────────────────────────────
const dirSwEq = '_tools/src-packs/DLC/scuole-witcher/witcher-dlc-sw-equipment';
const dirSwSch = '_tools/src-packs/DLC/scuole-witcher/witcher-dlc-sw-schematics';
mkDirSafe(dirSwEq); mkDirSafe(dirSwSch);

const schools = [
    { name: 'Gatto', extras: ['Balestra'] },
    { name: 'Grifone', extras: ['Balestra'] },
    { name: 'Lupo', extras: [] },
    { name: 'Manticora', extras: ['Scudo'] },
    { name: 'Orso', extras: ['Balestra'] },
    { name: 'Vipera', extras: ['Zanna'] }
];

schools.forEach(s => {
    // Equipment
    saveJson(dirSwEq, `Spada d'Acciaio del ${s.name}`, `Spada d'acciaio con marchio della Scuola del ${s.name}. Alta qualità e bilanciamento specifico per lo stile della scuola.`, 'SW');
    saveJson(dirSwEq, `Spada d'Argento del ${s.name}`, `Spada d'argento con marchio della Scuola del ${s.name}. Essenziale per i contratti sui mostri.`, 'SW');
    saveJson(dirSwEq, `Armatura del ${s.name}`, `Set di armatura completo (Torso, Braccia, Gambe) con i colori e le protezioni tipiche della Scuola del ${s.name}.`, 'SW');
    s.extras.forEach(ext => {
        saveJson(dirSwEq, `${ext} del ${s.name}`, `${ext} speciale progettato e utilizzato dai membri della Scuola del ${s.name}.`, 'SW');
    });

    // Schematics
    saveJson(dirSwSch, `Schema Spada d'Acciaio del ${s.name}`, `Schema tecnico complesso per forgiare la spada d'acciaio del ${s.name}. Livello Maestro.`, 'SW', 'item');
    saveJson(dirSwSch, `Schema Spada d'Argento del ${s.name}`, `Schema tecnico complesso per forgiare la spada d'argento del ${s.name}. Livello Maestro.`, 'SW', 'item');
    saveJson(dirSwSch, `Schema Armatura del ${s.name}`, `Schema tecnico per la realizzazione del set di armatura del ${s.name}. Livello Maestro.`, 'SW', 'item');
    s.extras.forEach(ext => {
        saveJson(dirSwSch, `Schema ${ext} del ${s.name}`, `Schema per la costruzione del ${ext.toLowerCase()} del ${s.name}.`, 'SW', 'item');
    });
});

// ─────────────────────────────────────────────────────────
// MS: MOSTRI SULLA STRADA
// ─────────────────────────────────────────────────────────
const dirMsMon = '_tools/src-packs/DLC/mostri-strada/witcher-dlc-ms-monsters';
const dirMsComp = '_tools/src-packs/DLC/mostri-strada/witcher-dlc-ms-components';
mkDirSafe(dirMsMon); mkDirSafe(dirMsComp);

const monstersMS = [
    { name: 'Alp', desc: 'Potente vampiro simile alla bruxa, predilige le zone abitate e assale i viaggiatori durante la notte. Agile e letale.' },
    { name: 'Gatto Mannaro', desc: 'Terianteropo nato da una terribile maledizione. Silenzioso e feroce nelle foreste o nei vicoli cittadini.' },
    { name: 'Glustyworp', desc: 'Enorme insettoide predatore che si finge un tronco alla deriva nelle paludi per ghermire prede incaute.' }
];

monstersMS.forEach(m => saveJson(dirMsMon, m.name, m.desc, 'MS', 'npc'));

const compMS = [
    { name: 'Saliva di Alp', desc: 'Sostanza corrosiva estratta dalle ghiandole di un Alp. Utile per pozioni e unguenti.' },
    { name: 'Denti di Gatto Mannaro', desc: 'Denti aguzzi estratti da un Gatto Mannaro. Possiedono proprietà alchemiche uniche.' },
    { name: 'Stomaco di Glustyworp', desc: 'Organo interno di un Glustyworp, ricco di acidi digestivi potenti.' },
    { name: 'Mutageno Alp (Blu)', desc: 'Mutageno blu estratto da un Alp. Aumenta la Volontà (+1).' },
    { name: 'Mutageno Gatto Mannaro (Rosso)', desc: 'Mutageno rosso estratto da un Gatto Mannaro. Aumenta i danni in mischia (+3).' },
    { name: 'Mutageno Glustyworp (Verde)', desc: 'Mutageno verde estratto da un Glustyworp. Aumenta la robustezza fisica (+10 PS).' }
];

compMS.forEach(c => saveJson(dirMsComp, c.name, c.desc, 'MS'));

// ─────────────────────────────────────────────────────────
// DP: DISABILITÀ E PROTESI
// ─────────────────────────────────────────────────────────
const dirDpEq = '_tools/src-packs/DLC/disabilita-protesi/witcher-dlc-dp-equipment';
const dirDpPng = '_tools/src-packs/DLC/disabilita-protesi/witcher-dlc-dp-png';
mkDirSafe(dirDpEq); mkDirSafe(dirDpPng);

const itemsDP = [
    { name: 'Sedia a Rotelle Base', desc: 'Modello semplice in legno e cotone per la mobilità di base.' },
    { name: 'Sedia a Rotelle di Qualità', desc: 'Modello rinforzato con acciaio e cuoio, più ergonomico e resistente.' },
    { name: 'Protesi Base', desc: 'Gamba o braccio di legno disadorno ma funzionale. Negano penalità alla VEL ma hanno limiti di manipolazione.' },
    { name: 'Protesi Magica', desc: 'Protesi ergonomica infusa con semplici incantesimi per manipolazioni di precisione.' },
    { name: 'Protesi Focus', desc: 'Il culmine della ricerca magica, adatta ai maghi come potente focus arcano (Focus 2, Focus Superiore).' },
    { name: 'Protesi da Witcher', desc: 'Protesi rinforzata progettata per il Sentiero. Ha nocche in argento per danni aggiuntivi e permette d\'incanalare il Caos.' },
    { name: 'Schema Sedia a Rotelle Base', desc: 'Schema tecnico per la costruzione di una sedia a rotelle standard.' },
    { name: 'Schema Sedia a Rotelle di Qualità', desc: 'Schema tecnico avanzato per una sedia a rotelle di alta qualità.' }
];

itemsDP.forEach(i => saveJson(dirDpEq, i.name, i.desc, 'DP'));

saveJson(dirDpPng, 'Voren di Dillingen', 'Witcher leggendario e pioniere nell\'uso di protesi avanzate per continuare a calcare il Sentiero nonostante le mutilazioni.', 'DP', 'npc');

console.log('Batch 1 complete.');
