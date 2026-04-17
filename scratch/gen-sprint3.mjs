import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function mkDirSafe(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function saveJson(dir, name, data) {
    const id = crypto.randomBytes(8).toString('hex');
    const safe = name.replace(/[^a-zA-Z0-9À-ÿ]/g, '_').toLowerCase();
    const filePath = path.join(dir, `${safe}_${id}.json`);
    const doc = {
        _id: id,
        name,
        type: 'valuable',
        img: `modules/witcher-compendium/assets/placeholder.webp`,
        system: { description: `<p>${data.desc}</p>`, sourcebook: data.sb },
        effects: [], flags: {},
        _stats: { systemId: 'TheWitcherItaNewSystem', coreVersion: 14 }
    };
    if (data.extra) Object.assign(doc.system, data.extra);
    fs.writeFileSync(filePath, JSON.stringify(doc, null, 4), 'utf8');
    console.log('✓', name);
    return id;
}

// ─────────────────────────────────────────────────────────
// BLOCCO A1 — witcher-components-mutageni-dw (DW Pag145)
// ─────────────────────────────────────────────────────────
const dirMutageniDW = '_tools/src-packs/CRAFTING/base/witcher-components-mutageni-dw';
mkDirSafe(dirMutageniDW);
console.log('\n== BLOCCO A1: Mutageni DW ==');

const mutageniDW = [
    // Rossi
    { name: 'Mutageno: Botchling (Rosso)', desc: 'Effetto: +2 Danni in Mischia. CD Mutazione: 18. Mutazione Minore: Palato fesso e sclera arrossata.', sb: 'DW 145', cat: 'Rosso' },
    { name: 'Mutageno: Cockatrice (Rosso)', desc: 'Effetto: +2 Danni in Mischia. CD Mutazione: 18. Mutazione Minore: Ciuffi di piume verdi.', sb: 'DW 145', cat: 'Rosso' },
    { name: 'Mutageno: Fenice (Rosso)', desc: 'Effetto: +2 Danni in Mischia. CD Mutazione: 20. Mutazione Minore: Ciuffi di piume grigie e luce dall\'interno.', sb: 'DW 145', cat: 'Rosso' },
    { name: 'Mutageno: Manticora (Rosso)', desc: 'Effetto: +1 RIF. CD Mutazione: 22. Mutazione Minore: Piccole corna e tratti felini.', sb: 'DW 145', cat: 'Rosso' },
    { name: 'Mutageno: Vendigo (Rosso)', desc: 'Effetto: +3 Danni in Mischia. CD Mutazione: 20. Mutazione Minore: Pelliccia irregolare e pelle grigia e malaticcia.', sb: 'DW 145', cat: 'Rosso' },
    // Verdi
    { name: 'Mutageno: Bullvore (Verde)', desc: 'Effetto: +10 PS. CD Mutazione: 20. Mutazione Minore: Escrescenze dure su tutto il corpo.', sb: 'DW 145', cat: 'Verde' },
    { name: 'Mutageno: Frightener (Verde)', desc: 'Effetto: +1 FIS. CD Mutazione: 22. Mutazione Minore: Occhi sfaccettati e scaglie di chitina.', sb: 'DW 145', cat: 'Verde' },
    { name: 'Mutageno: Garkain (Verde)', desc: 'Effetto: +10 PS. CD Mutazione: 20. Mutazione Minore: Escrescenze sulla testa.', sb: 'DW 145', cat: 'Verde' },
    { name: 'Mutageno: Orso (Verde)', desc: 'Effetto: +10 PS. CD Mutazione: 20. Mutazione Minore: Gran quantità di pelliccia.', sb: 'DW 145', cat: 'Verde' },
    { name: 'Mutageno: Shaelmaar (Verde)', desc: 'Effetto: +10 PS. CD Mutazione: 20. Mutazione Minore: Zone di pelle spessa e rocciosa.', sb: 'DW 145', cat: 'Verde' },
    { name: 'Mutageno: Succube (Verde)', desc: 'Effetto: +5 PS. CD Mutazione: 18. Mutazione Minore: Piccole corna e coda.', sb: 'DW 145', cat: 'Verde' },
    { name: 'Mutageno: Troll (Verde)', desc: 'Effetto: +5 PS. CD Mutazione: 18. Mutazione Minore: Pelle bluastra e spessa.', sb: 'DW 145', cat: 'Verde' },
    // Blu
    { name: 'Mutageno: Bruxa (Blu)', desc: 'Effetto: +1 VOL. CD Mutazione: 22. Mutazione Minore: Pelle semi-traslucida e voce sibilante.', sb: 'DW 145', cat: 'Blu' },
    { name: 'Mutageno: Elementale (Blu)', desc: 'Effetto: +3 Vigore. CD Mutazione: 20. Mutazione Minore (Terra): Escrescenze rocciose; (Fuoco): Piccoli getti di fuoco dalla bocca; (Ghiaccio): Sempre freddo al tocco.', sb: 'DW 145', cat: 'Blu' },
    { name: 'Mutageno: Foglet (Blu)', desc: 'Effetto: +2 Vigore. CD Mutazione: 18. Mutazione Minore: Debole luce interna e aspetto emaciato.', sb: 'DW 145', cat: 'Blu' },
    { name: 'Mutageno: Leshen (Blu)', desc: 'Effetto: +1 VOL. CD Mutazione: 22. Mutazione Minore: Piante su tutto il corpo.', sb: 'DW 145', cat: 'Blu' },
    { name: 'Mutageno: Pesta (Blu)', desc: 'Effetto: +2 Vigore. CD Mutazione: 18. Mutazione Minore: Pelle pallida e malaticcia e aspetto emaciato.', sb: 'DW 145', cat: 'Blu' },
];
mutageniDW.forEach(m => saveJson(dirMutageniDW, m.name, m));

// ─────────────────────────────────────────────────────────
// BLOCCO A2 — witcher-mutazioni-tc (TC Pag136)
// ─────────────────────────────────────────────────────────
const dirMutazioniTC = '_tools/src-packs/CRAFTING/caos/witcher-mutazioni-tc';
mkDirSafe(dirMutazioniTC);
console.log('\n== BLOCCO A2: Mutazioni TC ==');

const mutazioniTC = [
    { name: 'Regola Mutazione: CD Esperimento Avanzato', desc: 'CD base: 12. Modificatori: +6 Combinare 2 creature, +8 Combinare 3 creature, +8 Creatura già mutata, +3/Tratto aggiunto, +3/Creatura Senziente, +2/Creatura Complessa/Ardua, +2/Creatura in cattiva salute. Dura un giorno e consuma tutta la RES del Mago.', sb: 'TC 136' },
    { name: 'Regola Mutazione: Combinare Creature', desc: 'Richiede 2-3 creature integre, Mutageno Blu+Rosso+Verde (consumati). Si sceglie una Creatura Base e per ogni altra cavia si possono sostituire 2 Statistiche, trasferire fino a 2 Capacità e un qualsiasi numero di Attacchi. La creatura risultante acquisisce tutte le Vulnerabilità ed è sempre Odiata e Temuta, diventa Minaccia Difficile/Complessa.', sb: 'TC 136' },
    { name: 'Regola Mutazione: Mantenere Controllo', desc: 'Se successo e creatura Non Senziente: segue ordini per un giorno. Ogni giorno occorre superare prova di Bestiario (CD = CD Esperimento). In caso di fallimento il mostro diventa aggressivo per un breve periodo.', sb: 'TC 136' },
    { name: 'Regola Mutazione: Fallire Esperimento', desc: 'Si perde tutto il materiale. Si può salvare una sola cavia. Se senziente: INT scende a 1 (Ferale), Posizione Sociale = Odiato e Temuto. Può essere usata in futuri esperimenti senza penalità.', sb: 'TC 136' },
    // Tratti
    { name: 'Tratto Mutazione: Appendice Gigante', desc: 'Componenti: Mutageno Rosso ×3. Il danno di un\'arma naturale scelta aumenta di 1d6, l\'Affidabilità raddoppia e la cavia ottiene +10 PS. Applicabile più volte su armi naturali diverse.', sb: 'TC 139' },
    { name: 'Tratto Mutazione: Arto Aggiuntivo', desc: 'Componenti: Mutageno Rosso ×1, Mutageno Verde ×1, Arto Preservato ×1. La cavia ottiene un duplicato di un arto originale con tutte le Armi Naturali, Capacità e Vulnerabilità della creatura donatrice. L\'arto non può essere conservato da più di un anno.', sb: 'TC 139' },
    { name: 'Tratto Mutazione: Capacità Rigenerativa', desc: 'Componenti: Mutageno Verde ×2, Embrione di Endriaga ×2, Fegato di Troll ×1, Saliva di Lupo Mannaro ×3. La cavia ottiene la capacità Rigenerazione (guarisce 5 PS per Turno).', sb: 'TC 139' },
    { name: 'Tratto Mutazione: Adattamento Anfibio', desc: 'Componenti: Mutageno Blu ×1, Cervello di Drowner ×1, Corde Vocali di Sirena ×2. La cavia ottiene la capacità Anfibio (respira sott\'acqua, non affoga, nessuna penalità in acqua).', sb: 'TC 139' },
    { name: 'Tratto Mutazione: Corazza', desc: 'Componenti: Mutageno Verde ×3, Chitina ×3, Scaglie di Dragonide ×3. La cavia ottiene Resistenza ai danni perforanti e taglienti, perde le relative Vulnerabilità e la Vulnerabilità Punto Debole.', sb: 'TC 139' },
    { name: 'Tratto Mutazione: Immunità Artificiale', desc: 'Componenti: Mutageno Verde ×1, Saliva di Endriaga ×10, Veleno di Arachas ×3. La cavia diventa Immune a veleni e malattie.', sb: 'TC 139' },
    { name: 'Tratto Mutazione: Ali Innestate', desc: 'Componenti: Mutageno Blu ×1, Mutageno Verde ×1, Ali Preservate ×1. La cavia ottiene la Capacità Volo a normale VEL. Viene costretta a terra solo se Stordita o subisce 10+ danni (Atletica CD 16 per evitare danni da caduta).', sb: 'TC 139' },
    { name: 'Tratto Mutazione: Incrementare Massa', desc: 'Componenti: Mutageno Rosso ×3, Occhio di Demonio ×1. La cavia ottiene 30 PS, è immune agli effetti di caduta/spostamento, ma perde la Capacità Volo.', sb: 'TC 140' },
    { name: 'Tratto Mutazione: Migliorare Arma Naturale', desc: 'Componenti: Mutageno Rosso ×1, Zanne di Vampiro ×4, Uovo di Grifone ×1. Tutte le armi naturali della cavia ottengono l\'effetto Bilanciata.', sb: 'TC 140' },
    { name: 'Tratto Mutazione: Rendere Docile', desc: 'Componenti: Mutageno Blu ×1, Runa Triglav ×1. La cavia Senziente diventa Ferale (INT scende a 1). La Runa Triglav è incastonata nel cervello; può essere rimossa con Mani Guaritrici CD 24.', sb: 'TC 140' },
    { name: 'Tratto Mutazione: Testa Aggiuntiva', desc: 'Componenti: Mutageno Blu ×1, Mutageno Rosso ×1, Mutageno Verde ×1, Testa Preservata ×1. Alla cavia spunta una testa vestigiale con le Armi Naturali, Capacità e Vulnerabilità della creatura donatrice. La testa deve essere conservata da meno di un anno.', sb: 'TC 140' },
];
mutazioniTC.forEach(m => saveJson(dirMutazioniTC, m.name, m));

// ─────────────────────────────────────────────────────────
// BLOCCO A3 — witcher-necromanzia (TC Pag131)
// ─────────────────────────────────────────────────────────
const dirNecro = '_tools/src-packs/MAGIA/caos/witcher-necromanzia';
mkDirSafe(dirNecro);
console.log('\n== BLOCCO A3: Necromanzia TC ==');

const necromanzia = [
    // Regole
    { name: 'Regola Necromanzia: Spiriti Senza Pace (Novizio)', desc: '1-5: Tramite (bonus +2 alle prove, tira su tabella se ottieni 1-3). 6-9: Ospiti Indesiderati (spirito con effetto Fattura, non rimuovibile con metodi normali). 10: Orda di Spettri (1d6 Wraith entro 5m, attaccano la creatura più vicina).', sb: 'TC 131' },
    { name: 'Regola Necromanzia: Spiriti Senza Pace (Esperto)', desc: '1-3: Tramite. 4-6: Ospiti Indesiderati. 7-8: Orda di Spettri. 9-10: Terreno Sconsacrato (maledizione Persecuzione sul luogo).', sb: 'TC 131' },
    { name: 'Regola Necromanzia: Spiriti Senza Pace (Maestro)', desc: '1-2: Tramite. 3-4: Ospiti Indesiderati. 5-6: Orda di Spettri. 7-8: Terreno Sconsacrato. 9-10: Il Penitente appare entro 5m, perseguita l\'incantatore ogni notte fino alla morte o al bando.', sb: 'TC 133' },
    // Incantesimi
    { name: 'Incantesimo Necromante: Restaurare Cadavere', desc: 'Livello: Esperto. Costo RES: 7. Crea copie spettrali di muscoli, pelle e capelli di un corpo. Bersaglio diventa versione traslucida con ferite del momento della morte, toccabile ed esaminabile. Le "parti molli" possono essere staccate fino a 4m. Portata: 4m. Durata: 1 ora. Difese: Nessuna.', sb: 'TC 134' },
    { name: 'Incantesimo Necromante: Tempesta di Anime', desc: 'Livello: Maestro. Costo RES: 22. Evoca 1d6+4 Wraith urlanti, completamente accecati dalla rabbia, che attaccano chiunque compreso il mago e i suoi alleati. Portata: 10m. Durata: 2d6 Round. Difese: Nessuna.', sb: 'TC 134' },
    // Rituali
    { name: 'Rituale Necromante: Rianimare Cadavere', desc: 'Livello: Esperto. Costo RES: 10. Evoca un\'anima e la costringe a possedere un cadavere. Il corpo si muove come se fosse vivo ma con terribili dolori (-3 a Resistere a Coercizioni). Può rispondere a domande se ha polmoni, corde vocali, bocca, lingua e metà cervello. Prep: 10 Round. CD: 18. Durata: Attiva (3 RES/min). Componenti: 1 Cadavere integro, Candele ×5, Essenza di Wraith ×2, Gessetto ×4, Occhio di Corvo ×2, Polvere di Spettro ×5, Quintessenza ×5.', sb: 'TC 132' },
    { name: 'Rituale Necromante: Creare Faro dell\'Anima', desc: 'Livello: Esperto. Costo RES: 10. Produce un totem d\'ossa alto 1m (10 PS). Teschio Umano/Razza Antica: -3 CD e -3 RES rituali necromantici, tira 1d10-2 su Tabella Spiriti in caso di Disastro. Teschio Bestia/Mostro: +2 prove Attacco/Difesa alle creature create con necromanzia. Prep: 10 Round. CD: 16. Durata: 1 giorno. Componenti: 1 Teschio, Cenere ×10, Cuoio ×3, Legname ×5, Quintessenza ×3, Polvere di Spettro ×2, Polvere Infusa ×2, Sasso ×2.', sb: 'TC 132' },
    { name: 'Rituale Necromante: Sintesi di Cadfan', desc: 'Livello: Maestro. Costo RES: 16. Rianima parzialmente numerosi corpi riunendoli in una singola creatura che esegue alla lettera qualsiasi compito, incapace di pensare. Simile a un golem. Prep: 15 Round. CD: 22. Durata: Permanente. Componenti: 10 Cadaveri (morti nelle ultime 24h), Acqua Ducale ×3, Candele ×10, Erbe da Concia ×10, Essenza di Wraith ×5, Frammenti Lunari ×1, Gessetto ×5, Occhio di Corvo ×5, Petali di Elleboro ×2, Polvere di Spettro ×5, Quintessenza ×10.', sb: 'TC 135' },
    { name: 'Rituale Necromante: Sogno Blu di Hanmarvyn', desc: 'Livello: Maestro. Costo RES: 16. Il bersaglio entro 4m riceve i ricordi degli ultimi 10 minuti di vita di un defunto (20 min se sotto Allucinogeno). Il bersaglio deve superare Tempra CD 24 altrimenti diventa Moribondo. Prep: 10 Round. CD: 18. Durata: 10 min. Componenti: Cadavere ×1, Essenza di Wraith ×3, Fosforo ×3, Frammenti Lunari ×2, Muschio Verde ×2, Petali di Ginatia ×2, Polvere di Spettro ×2, Quintessenza ×10, Radice di Mandragora ×1, Soluzione di Mercurio ×1.', sb: 'TC 135' },
];
necromanzia.forEach(n => saveJson(dirNecro, n.name, n));

// ─────────────────────────────────────────────────────────
// BLOCCO B — witcher-armor-racconti (LR Pag167)
// L'unico materiale LR rilevante su Pag167 è armi (già in witcher-weapons-racconti)
// e componenti alchemici. NON ci sono armature. Skip confermato.
// ─────────────────────────────────────────────────────────
console.log('\n== BLOCCO B: witcher-armor-racconti ==');
console.log('  → SKIP: Pag167 LR non contiene armature. Solo armi (già presenti) e componenti alchemici.');

// ─────────────────────────────────────────────────────────
// BLOCCO C — witcher-lore-chaos (TC Pag007 + Pag010)
// ─────────────────────────────────────────────────────────
const dirLoreCaos = '_tools/src-packs/LORE/caos/witcher-lore-chaos';
mkDirSafe(dirLoreCaos);
console.log('\n== BLOCCO C: Lore Chaos TC ==');

const loreCaos = [
    { name: 'Lore: Redigere uno Scritto (Introduzione TC)', desc: 'Il Tomo del Caos è stato scritto da Brandon di Oxenfurt in collaborazione con Glynnis var Treharne, ex-direttrice di Gweison Haul. Raccoglie informazioni su Magie Riunite (Incantesimi, Invocazioni, Segni, Rituali, Fatture), Maghi, Preti, Druidi, Magia Quotidiana (Doni Magici), Mercato Magico, Arti Oscure (Necromanzia, Goezia, Mutazione) e Società Magica. Include l\'avventura "Una Clausola Vincolante".', sb: 'TC 7' },
    { name: 'Lore: Linee Geomantiche — Definizione', desc: 'Le Linee Geomantiche sono sentieri di magia invisibili e semi-intangibili che attraversano il mondo. Dove si intersecano nascono i Luoghi di Potere (spesso sedi di monoliti elfici). Ogni personaggio con punteggio di Vigore sente un crampo all\'anulare entro 10m da una Linea. Un Mago può usare Arte del Mago per definire posizione e direzione.', sb: 'TC 10' },
    { name: 'Lore: Linee Geomantiche — Trarre Potere', desc: 'Un incantatore in contatto fisico con una Linea Geomantica può usare un\'Azione per trarne potere (Lanciare Incantesimi CD 16). In caso di successo: sblocca il potere finché resta in contatto. I Magi possono usare solo Incantesimi dell\'elemento della Linea. Preti e Druidi usano le loro Invocazioni liberamente. In caso di fallimento: Disastro Elementale senza danni aggiuntivi. I Witcher e altri incantatori possono tentare ma raramente hanno l\'addestramento.', sb: 'TC 10' },
    { name: 'Lore: Linee Geomantiche — Elemento Acqua', desc: 'Segnali: Umidità innaturale, ruscelli, onde anomale. Benefici: Chi lancia magie d\'acqua considera la propria abilità di Lanciare Incantesimi 2 punti più alta. Penalità: Vivide allucinazioni (scelte dal GM) che durano fino a 1 minuto dopo essersi scollegati.', sb: 'TC 11' },
    { name: 'Lore: Linee Geomantiche — Elemento Aria', desc: 'Segnali: Frequenti mulinelli di polvere, cirri, odore di ozono. Benefici: Chi usa magia dell\'aria può lanciarla come se l\'avesse appresa (non può insegnarla né trascriverla dopo). Penalità: Il GM sostituisce l\'effetto con un altro Incantesimo d\'aria; il costo in RES rimane invariato.', sb: 'TC 11' },
    { name: 'Lore: Linee Geomantiche — Elemento Fuoco', desc: 'Segnali: Piante avvizzite, foschia da calore, sole accecante. Benefici: Chi lancia magie di fuoco somma +2 al danno e la probabilità di incendio raggiunge il 100%. Penalità: Il Mago è obbligato a spendere RES aggiuntiva per lanciare di nuovo lo stesso incantesimo contro un bersaglio casuale.', sb: 'TC 11' },
    { name: 'Lore: Linee Geomantiche — Elemento Terra', desc: 'Segnali: Crescita anomala di piante, alberi contorti, pietre disposte in modo strano. Benefici: Chi è bersaglio di una magia di terra da questa Linea subisce -4 per difendersi. Penalità: Il collegamento alla Linea viene interrotto e la CD per ripristinarlo aumenta di 2.', sb: 'TC 11' },
    { name: 'Lore: Linee Geomantiche — Preti e Druidi', desc: 'Elemento Misto: Benefici: Chi lancia da una Linea Geomantica aumenta di 4 la propria Soglia di Vigore. Penalità: La Soglia di Vigore è ridotta di 2 per 6 ore. Ogni ulteriore Disastro o Sovraffaticamento aumenta la penalità di 2 punti. Se il Vigore arriva a 0 o meno si perde la capacità magica fino al ripristino.', sb: 'TC 11' },
    { name: 'Lore: Luoghi di Potere', desc: 'Un Luogo di Potere è l\'intersezione di due Linee Geomantiche dello stesso elemento. Si trovano di solito in luoghi legati all\'elemento (delta di fiumi per l\'acqua, crateri vulcanici per il fuoco, cime montane per l\'aria). Se non sfruttati di recente, possono richiamare spontaneamente elementali molto aggressivi.', sb: 'TC 10' },
];
loreCaos.forEach(l => saveJson(dirLoreCaos, l.name, l));

console.log('\n✅ Sprint 3 completato!');
