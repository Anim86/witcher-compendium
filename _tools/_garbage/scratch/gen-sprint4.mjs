import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function mkDirSafe(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function saveJson(dir, name, desc, sb, type = 'npc') {
    const id = crypto.randomBytes(8).toString('hex');
    const safe = name.replace(/[^a-zA-Z0-9À-ÿ_]/g, '_').replace(/__+/g, '_').toLowerCase();
    const filePath = path.join(dir, `${safe}_${id}.json`);
    const doc = {
        _id: id,
        name,
        type,
        img: `modules/witcher-compendium/assets/BESTIARIO/PNG/placeholder.webp`,
        system: {
            description: `<p>${desc}</p>`,
            sourcebook: sb
        },
        effects: [], flags: {},
        _stats: { systemId: 'TheWitcherItaNewSystem', coreVersion: 14 }
    };
    fs.writeFileSync(filePath, JSON.stringify(doc, null, 4), 'utf8');
    console.log('✓', name);
}

// ─────────────────────────────────────────────────────────
// BLOCCO D — witcher-components-mutageni-tc (TC Pag212)
// ─────────────────────────────────────────────────────────
console.log('\n== BLOCCO D: Componenti Mutageni TC Pag212 ==');
console.log('SKIP COMPLETO:');
console.log('  - Corno di Bes → già in witcher-components (MB)');
console.log('  - Grasso d\'Orso → già in witcher-components (MB)');
console.log('  - Pelle d\'Orso → già in witcher-components (MB)');
console.log('  - Teschio di Mari Lwyd → già in witcher-components (MB)');
console.log('  - Mutageno Orso (Verde) → già in witcher-mutations (MB) come "Mutageno dell\'Orso"');
console.log('  - Mutageno Penitente (Blu) → già in witcher-mutations (MB) come "Mutageno del Penitente"');
console.log('  → Nessun file creato. Pack non necessario.');

// ─────────────────────────────────────────────────────────
// BLOCCO F — witcher-png-racconti (LR Pag020)
// Solo PNG NON già presenti in witcher-png (MB)
// ─────────────────────────────────────────────────────────
const dirPngRacconti = '_tools/src-packs/BESTIARIO/witcher-png-racconti';
mkDirSafe(dirPngRacconti);
console.log('\n== BLOCCO F: PNG Racconti LR ==');
console.log('  (Skip: Annegina, Catrin, Clarisse, Clarisse, Francine, Strega di Rupe della Lince,');
console.log('   Leblanc de Surmann, Louise van Adelaide, Dandelion — già in witcher-png MB)');

const pngLR = [
    // Avventura "Nell'Alderwood" (Pag027)
    { name: 'Cooper Mawik', sb: 'LR 64', desc: 'Nano di Mahakam, minatore e artigiano. Ambisce a entrare nel Consiglio degli Anziani. Detesta gli umani e si vanta di fregarli. Complice nell\'omicidio di Rendal Harkus. Facile-Semplice, Senziente, Umanoide.' },
    { name: 'Scagnozzi di Mawik', sb: 'LR 66', desc: 'Giovani nani assoldati da Cooper Mawik. Fedeli alla sua retorica anti-umani. Facile-Semplice, Senziente, Umanoide.' },
    { name: 'Enid Harkus', sb: 'LR 66', desc: 'Giovane nana determinata a trovare il responsabile della morte del fratello Rendal. Non si ferma davanti a nulla pur di ottenere giustizia. Personaggio PNG chiave dell\'avventura "Fredde Menzogne".' },
    { name: 'Brodgar Farrag', sb: 'LR 66', desc: 'Giovane nano ingenuo coinvolto in una truffa durante il suo drekthag (anno sabbatico). Ha ucciso Rendal Harkus per panico. Cerca di fuggire con il Martello di Cursetter. Personaggio PNG-colpevole dell\'avventura "Fredde Menzogne".' },
    // Avventura "Omicidio a Maribor" (Pag073)
    { name: 'Layton Hermann', sb: 'LR 83', desc: 'Capo del Tempio del Coram Agh Tera a Maribor. Diffonde paura, malattia e morte da oltre dieci anni. È impossibile ragionare con lui o intimidirlo. Difficile-Complesso, Senziente, Umanoide. VIG 10.' },
    { name: 'Cultista del Coram Agh Tera', sb: 'LR 84', desc: 'Membro del culto di Layton Hermann. Spinto dalla Rabbia, è impossibile intimorirlo. Variante magica con Vigore 5, Lanciare Incantesimi 12 (Marchio a Fuoco, Polvere Accecante, Dissipazione). Facile-Semplice, Senziente, Umanoide.' },
    // Avventura "Nell'Arena" (Pag097) — Squadre Torneo
    { name: 'Skuld (Vergini di Ferro)', sb: 'LR 115', desc: 'Leader delle Vergini di Ferro, guerriera del Clan An Craite delle Skellige. Capelli rosso vivo, occhi blu, cicatrice sul mento. Armatura con pelliccia d\'orso e rune Skellige. Porta una Spada di Ferro. Competitiva ma amichevole.' },
    { name: 'Mikaela (Vergini di Ferro)', sb: 'LR 115', desc: 'Membro delle Vergini di Ferro. Bassa e robusta, capelli color caffè spettinati, indossa pellicce di lupo. Porta un\'Ascia da Berserker.' },
    { name: 'Asdis (Vergini di Ferro)', sb: 'LR 115', desc: 'Membro delle Vergini di Ferro. Alta e magra, cicatrice sul collo. Tirapugni e Costoliere alla cintura.' },
    { name: 'Thora (Vergini di Ferro)', sb: 'LR 115', desc: 'Membro delle Vergini di Ferro. Muscolosa, trecce bionde, numerose cicatrici. Porta un\'Ascia da Battaglia e uno Scudo da Razziatore Skellige.' },
    { name: 'Rhundin (Artigiani di Mahakam)', sb: 'LR 117', desc: 'Leader degli Artigiani di Mahakam. Studioso meticoloso, prende appunti continui sugli avversari. Capelli sale e pepe ricci, baffi grigi, barba lunga, occhiali d\'oro. Nessuna arma visibile. Estremamente competitivo.' },
    { name: 'Arkam (Artigiani di Mahakam)', sb: 'LR 117', desc: 'Guardia del corpo degli Artigiani di Mahakam. Calvo, gran barba rossa, armatura pesante molto usurata. Porta Ascia da Battaglia, Scudo di Cuoio e Balestrino. Stoico.' },
    { name: 'Aenarinn (Quintetto di Claremont)', sb: 'LR 118', desc: 'Leader del Quintetto di Claremont, elfo. Mohawk marrone scuro, tatuaggio di viverne sul braccio sinistro. Armatura di cuoio col sole d\'oro. Porta due Accette e un Pugnale. Veterano di guerra.' },
    { name: 'Varin (Quintetto di Claremont)', sb: 'LR 118', desc: 'Bardo umano del Quintetto di Claremont, appena uscito da Oxenfurt. Aspira a diventare famoso come Dandelion. Capelli biondo scuro, abito nero e cremisi, porta sempre il suo violino.' },
    // Katakan
    { name: 'Lady Fortuna (Katakan)', sb: 'LR 120', desc: 'Katakan. Vera identità: Emeryn Aep Bruche, nobildonna di Nazair. Intelligente e arrogante, trucca le scommesse. Abito nero aderente, collana di metallo nero con diamante. Cerca di farsi amici Nobili e Bardi per ricattarli.' },
    { name: 'Lo Jarl (Katakan)', sb: 'LR 122', desc: 'Katakan. Vera identità: Sigurd di Spikeroog, mago di Ban Ard. Ossessionato dalla cultura Skellige pur non essendone originario. Tunica cremisi, pelliccia di lupo, protesi al braccio destro. Focus: Anello di ferro nero e acciaio meteorico.' },
    { name: 'Prinny Prin-Prin (Katakan)', sb: 'LR 124', desc: 'Katakan. Vera identità: Sabina La Pomerov, damigella di Toussaint. Diciannovenne, abito rosa a cascata di gonne. Cerca uno spasimante per il cugino Jean-Lucas de Beaumanoir. Primo viaggio fuori dal ducato.' },
    { name: 'La Stregonessa (Katakan)', sb: 'LR 127', desc: 'Katakan. Vera identità: Erin Oswa Aep Led, cieca, originaria di Kovir. Appassionata collezionista di cimeli dei Witcher. Porta un medaglione della Scuola dell\'Orso. Si muove con bastone d\'argento con sfera.' },
    { name: 'Est Est (Katakan)', sb: 'LR 130', desc: 'Katakan. Vera identità: Pavella Affe Ittad, originaria di Cintra, ora fedele a Nilfgaard. Commerciante di seta. Ama eccedere nel vino e nelle feste. Di solito si ubriaca agli eventi sociali.' },
    { name: 'Cuor Nero (Katakan)', sb: 'LR 131', desc: 'Katakan. Vera identità: Hurzivelt Dran Pozan, mezz\'elfo di Rivia. I suoi genitori furono uccisi nel pogrom di Rivia. Freddo e distante, ama il Gwent. Siede sempre da solo, mescolando le carte.' },
    // Avventura "La Damigella Circondata di Farfalle" (Pag139)
    { name: 'La Damigella Circondata di Farfalle', sb: 'LR 154', desc: 'Creatura derivata dalla maledizione di Francine Marchand. Otto ciocche di capelli animati (PS 15 ciascuna, Pr 12) che attaccano con Frusta di Capelli 16 (3d6+2, 20m). Difficile-Complesso. Immune a Ferite Critiche, Atterramento, Coercizione, Fuoco, Paura, Veleno. Vulnerabile a Unguento Anti-Maledetti. Vede tramite vibrazioni.' },
    { name: 'Armatura Marionetta', sb: 'LR 152', desc: 'Armatura animata dai capelli della Damigella Circondata di Farfalle. Incapace di pensiero. Armatura 20 (0 alla Testa). Immune a veleno, fuoco, mente/emozioni. Vulnerabile a Unguento Anti-Maledetti e acciaio (Punto Debole). Attacca con Gleddyf (ATT 12, T, 2d6+2). Punto Debole: Tagliare i Fili alla testa (9+ danni taglienti = distruzione).' },
];

pngLR.forEach(p => saveJson(dirPngRacconti, p.name, p.desc, p.sb, 'npc'));

console.log('\n✅ Blocchi D+F completati!');
