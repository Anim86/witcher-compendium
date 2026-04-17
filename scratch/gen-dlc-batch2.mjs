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
// TS: TOUSSAINT (Il Carro di Rodolf Vol.1)
// ─────────────────────────────────────────────────────────
const dirTsEq = '_tools/src-packs/DLC/toussaint/witcher-dlc-ts-equipment';
const dirTsAlc = '_tools/src-packs/DLC/toussaint/witcher-dlc-ts-alchemy';
const dirTsSch = '_tools/src-packs/DLC/toussaint/witcher-dlc-ts-schematics';
const dirTsPng = '_tools/src-packs/DLC/toussaint/witcher-dlc-ts-png';
mkDirSafe(dirTsEq); mkDirSafe(dirTsAlc); mkDirSafe(dirTsSch); mkDirSafe(dirTsPng);

const itemsTS = [
    { name: 'Borsa di Biglie', desc: 'Piccola borsa piena di biglie metalliche o di vetro. Sparse a terra possono far inciampare i nemici (Atletica CD 14).' },
    { name: 'Otre', desc: 'Contenitore per acqua o vino, essenziale per i lunghi viaggi sotto il sole di Toussaint.' },
    { name: 'Bottiglia', desc: 'Bottiglia di vetro standard per vino o elisir.' },
    { name: 'Pala', desc: 'Attrezzo da scavo robusto, utile anche come arma improvvisata (2d6 C).' },
    { name: 'Bussola', desc: 'Strumento di navigazione raro. Fornisce +3 a Sopravvivenza per orientarsi.' },
    { name: 'Pietra Solare', desc: 'Gemma magica usata dai marinai di Skellige per trovare il sole tra le nuvole. +2 a Sopravvivenza per orientarsi.' },
    { name: 'Corno da Segnalazione', desc: 'Corno udibile fino a 1,6km di distanza per segnalazioni tattiche.' },
    { name: 'Razioni da Viaggio (1 giorno)', desc: 'Cibo secco e conservato per il sostentamento quotidiano del viaggiatore.' },
    { name: 'Fischietto da Segnalazione', desc: 'Fischietto metallico udibile fino a 800m. Discreto ed efficace.' },
    { name: 'Torcia', desc: 'Torcia standard per illuminazione (raggio 5m). Può causare Fuoco (25%) in mischia.' },
    { name: 'Migliorie per Balestre', desc: 'Modifiche strutturali per aumentare la precisione o la potenza delle balestre.' }
];
itemsTS.forEach(i => saveJson(dirTsEq, i.name, i.desc, 'TS'));

const alcTS = [
    { name: 'Pozione di Toussaint', desc: 'Pozione locale rinomata per le sue proprietà rinfrescanti e curative minori.' }
];
alcTS.forEach(a => saveJson(dirTsAlc, a.name, a.desc, 'TS'));

const schTS = [
    { name: 'Schema Armi di Toussaint', desc: 'Schema tecnico per la realizzazione delle prestigiose armi decorate del ducato.' }
];
schTS.forEach(s => saveJson(dirTsSch, s.name, s.desc, 'TS'));

saveJson(dirTsPng, 'Rodolf Kazmer', 'Mercante nano veterano delle Grandi Guerre. Viaggia con il suo carro carico di merci rare e storie incredibili.', 'TS', 'npc');

// ─────────────────────────────────────────────────────────
// AP: ARNESI DA PROFESSIONISTA
// ─────────────────────────────────────────────────────────
const dirApEq = '_tools/src-packs/DLC/arnesi/witcher-dlc-ap-equipment';
const dirApAlc = '_tools/src-packs/DLC/arnesi/witcher-dlc-ap-alchemy';
mkDirSafe(dirApEq); mkDirSafe(dirApAlc);

const itemsAP = [
    { name: 'Amplificatore', desc: 'Piccolo corno metallico che amplifica i suoni attraverso le pareti.' },
    { name: 'Anello del Favore', desc: 'Anello in oro e argento che può ripristinare la Fortuna (1d10, con 1, 5, 10).' },
    { name: 'Bambola da Magia Nera', desc: 'Bambola usata per scagliare una fattura specifica tramite auto-ferimento.' },
    { name: 'Baule Nascosto', desc: 'Baule progettato per essere occultato all\'interno di altri mobili o strutture.' },
    { name: 'Bussola Magica', desc: 'Bussola incantata che punta verso un oggetto visualizzato dal possessore (Resistere Coercizione).' },
    { name: 'Camera di Distillazione', desc: 'Serie di tubi per purificare sostanze alchemiche (fino a 10 unità in versione Pura).' },
    { name: 'Coppia di Puntelli', desc: 'Puntelli per rinforzare ripari, conferendo +3 PR.' },
    { name: 'Cote Nanica', desc: 'Pietra per affilare che conferisce l\'effetto Trapassare per un singolo scontro.' },
    { name: 'Guida del Raccoglitore', desc: 'Libro rilegato che riduce la CD di raccolta ingredienti e ne aumenta la resa.' },
    { name: 'Incensiere Medico', desc: 'Diffonde i vapori di prodotti alchemici bruciati in un raggio di 6m.' },
    { name: 'Libro di Racconti', desc: 'Fornisce superstizioni comuni e +1 alle prove di Bestiario.' },
    { name: 'Mantello Mimetico', desc: 'Mantello con asole per mimetismo ambientale (+1 a Nascondersi nelle selve).' },
    { name: 'Potestaquisitor', desc: 'Dispositivo che rileva anomalie magiche, spettri, dimeritium e veri draghi in un raggio di 20m.' },
    { name: 'Serratura con Trappola', desc: 'Serratura che incula un ago avvelenato in caso di scassinamento fallito.' },
    { name: 'Strumento Musicale Elfico', desc: 'Liuto o flauto incantato che permette di ammaliare il pubblico.' },
    { name: 'Taglia-monete', desc: 'Marchingegno per dividere le corone e raddoppiarne fittiziamente il numero.' },
    { name: 'Tavolo Strategico Portatile', desc: 'Scatola con mappe e segnalini per pianificare battaglie e ottenere risposte tattiche (Tattica).' }
];
itemsAP.forEach(i => saveJson(dirApEq, i.name, i.desc, 'AP'));

const alcAP = [
    { name: 'Aiuto dell\'Investigatore', desc: 'Elisir alchemico che acuisce i sensi per il rilevamento di prove.' },
    { name: 'Elisir Adrenalinico', desc: 'Sostanza che accelera il battito cardiaco per reazioni rapide.' },
    { name: 'Rossetto Velenoso', desc: 'Veleno letale applicato come cosmetico.' },
    { name: 'Unguento Cinereo', desc: 'Unguento alchemico dalle proprietà curative o protettive.' },
    { name: 'Veleno di Cappuccio di Monaco', desc: 'Potente tossina naturale estratta dalla pianta omonima.' },
    { name: 'Puro Caelum', desc: 'Sostanza alchemica raffinata (Pura). Vale il doppio della sostanza base.' },
    { name: 'Puro Etere', desc: 'Sostanza alchemica raffinata (Pura). Vale il doppio della sostanza base.' },
    { name: 'Puro Fulgur', desc: 'Sostanza alchemica raffinata (Pura). Vale il doppio della sostanza base.' },
    { name: 'Puro Hydragenum', desc: 'Sostanza alchemica raffinata (Pura). Vale il doppio della sostanza base.' },
    { name: 'Puro Quebrith', desc: 'Sostanza alchemica raffinata (Pura). Vale il doppio della sostanza base.' },
    { name: 'Puro Rebis', desc: 'Sostanza alchemica raffinata (Pura). Vale il doppio della sostanza base.' },
    { name: 'Puro Sol', desc: 'Sostanza alchemica raffinata (Pura). Vale il doppio della sostanza base.' },
    { name: 'Puro Vermiglio', desc: 'Sostanza alchemica raffinata (Pura). Vale il doppio della sostanza base.' },
    { name: 'Puro Vetriolo', desc: 'Sostanza alchemica raffinata (Pura). Vale il doppio della sostanza base.' }
];
alcAP.forEach(a => saveJson(dirApAlc, a.name, a.desc, 'AP'));

// ─────────────────────────────────────────────────────────
// NP: NUOVE PROFESSIONI
// ─────────────────────────────────────────────────────────
const dirNp = '_tools/src-packs/DLC/nuove-professioni/witcher-dlc-np-professions';
mkDirSafe(dirNp);

const professionsNP = [
    { name: 'Corriere', desc: 'Professionista dei viaggi rapidi, esperto nel recapitare messaggi e pacchi in ogni condizione climatica.' },
    { name: 'Scout', desc: 'Esploratore e guida esperta, capace di muoversi silenziosamente e mappare territori ignoti.' },
    { name: 'Contrabbandiere', desc: 'Esperto nel trasporto illegale di merci, capace di eludere controlli e navigare rotte segrete.' },
    { name: 'Villico', desc: 'La spina dorsale del Continente. Esperto di agricoltura, vita rurale e resilienza contro le avversità.' }
];

professionsNP.forEach(p => saveJson(dirNp, p.name, p.desc, 'NP', 'item'));

console.log('Batch 2 complete.');
