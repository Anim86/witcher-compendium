import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dir = '_tools/src-packs/GAMEPLAY/base/witcher-investigations';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const indizi = [
    { name: 'Indizio: Analisi Mistica', desc: 'Usare sensi e addestramento mistico alla ricerca di aure e altri segni di magia. Abilità: Arte del Mago. Danno: 1d10+INT. Penalità: 1d10 danni al Focus. Con un Disastro bisogna tirare sulla Tabella dei Disastri Magici.' },
    { name: 'Indizio: Analizzare Prove', desc: 'Identificare un veleno da un campione. Abilità: Alchimia o Manifattura. Danno: 1d6+MAN. Penalità: 1d6 danni al Focus. Con un Disastro l’Indizio è danneggiato.' },
    { name: 'Indizio: Decifrare', desc: 'Decifrare un messaggio in codice o in un’altra lingua. Abilità: Falsificare o Istruzione. Danno: 1d6+INT. Penalità: 1d6 danni al Focus.' },
    { name: 'Indizio: Esaminare il Cadavere', desc: 'Determinare l’arma del delitto dalle ferite. Abilità: Pronto Soccorso. Danno: 1d6+MAN. Penalità: 1d6 danni al Focus. Con un Disastro il corpo è danneggiato.' },
    { name: 'Indizio: Esaminare la Scena', desc: 'Osservare il luogo del delitto per trovare nuovi Indizi. Abilità: Accortezza. Danno: 1d6+INT. Penalità: 1d6 danni al Focus. Con un Disastro la scena è compromessa.' },
    { name: 'Indizio: Interrogatorio', desc: 'Interrogare un sospetto o un testimone. Abilità: Abilità Sociali e Sensibilità. Danno: 1d10+EMP. Penalità: 1d10 danni al Focus. Con un Disastro interazioni sociali con il PNG subiscono -5 per una settimana.' },
    { name: 'Indizio: Pedinare', desc: 'Seguire un sospetto o appostarsi. Abilità: Nascondersi. Danno: 1d6+INT. Penalità: 1d6 danni al Focus e un eventuale scontro con la persona capita.' },
    { name: 'Indizio: Pettegolezzi', desc: 'Parlare con amici dei giri giusti. Abilità: Etichetta o Scaltrezza. Danno: 1d6+EMP. Penalità: 1d6 danni al Focus. Con un Disastro si irrita l’interlocutore.' },
    { name: 'Indizio: Ricerche', desc: 'Esaminare vecchi testi sui mostri. Abilità: Bestiario o Istruzione. Danno: 1d10+INT. Penalità: 1d10 danni al Focus.' },
    { name: 'Indizio: Seguire il denaro', desc: 'Esaminare i libri contabili della vittima. Abilità: Commerciare. Danno: 1d6+INT. Penalità: 1d6 danni al Focus.' },
    { name: 'Indizio: Seguire Tracce', desc: 'Identificare una serie di impronte sulla scena. Abilità: Bestiario o Sopravvivenza. Danno: 1d6+INT. Penalità: 1d6 danni al Focus.' }
];

const ostacoli = [
    { name: 'Ostacolo: Autorità', desc: 'Un funzionario locale vuole bloccare l’indagine.' },
    { name: 'Ostacolo: Clima', desc: 'Una tempesta ha cancellato le tracce.' },
    { name: 'Ostacolo: Cospirazione', desc: 'Qualcuno sta cercando di insabbiare le prove.' },
    { name: 'Ostacolo: Distrazione', desc: 'Un altro evento rende difficile concentrarsi sulle indagini.' },
    { name: 'Ostacolo: Esaurimento', desc: 'Lo spirito è forte, la carne un po’ meno.' },
    { name: 'Ostacolo: Falsa Pista', desc: 'Qualcosa sembra un Indizio, ma non lo è (da presentare come normale Prova d\'Indagine).' },
    { name: 'Ostacolo: Indizio Mancante', desc: 'Un Indizio non è disponibile al momento e la frustrazione pesa sul Focus.' },
    { name: 'Ostacolo: Passaggio del Tempo', desc: 'È passato troppo tempo dal crimine, cancellando le prove.' },
    { name: 'Ostacolo: Pessimo Ambiente', desc: 'Il crimine è avvenuto in un luogo inospitale, come una zona di guerra.' },
    { name: 'Ostacolo: Pettegolezzi', desc: 'Le voci che corrono rendono gli abitanti riluttanti a collaborare.' },
    { name: 'Ostacolo: Situazione Poco Familiare', desc: 'Il crimine coinvolge un elemento mai incontrato prima dal personaggio.' }
];

const regole = [
    { name: 'Regola Indagini: Complessità Mistero', desc: 'La Complessità rappresenta la quantità di lavoro necessaria (da 25 Facile a 200 Quasi Impossibile). I giocatori fanno danni alla complessità tramite gli indizi finché arriva a 0.' },
    { name: 'Regola Indagini: Focus', desc: 'Focus = [(VOL+INT)/2]x3. Il Focus scende quando gli indizi falliscono o si colpiscono ostacoli. Se arriva a 0, la mente del pg è troppo confusa per procedere fino al prossimo riposo.' }
];

const allEntities = [...indizi, ...ostacoli, ...regole];

allEntities.forEach(item => {
    const id = crypto.randomBytes(8).toString('hex');
    const safeName = item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filePath = path.join(dir, `${safeName}_${id}.json`);
    
    const d = {
        _id: id,
        name: item.name,
        type: 'valuable', // Generico
        img: `modules/witcher-compendium/assets/GAMEPLAY/base/witcher-investigations/${safeName}.webp`,
        system: {
            description: `<p>${item.desc}</p>`,
            sourcebook: 'DW'
        },
        _stats: {
            systemId: "TheWitcherItaNewSystem",
            coreVersion: 14
        }
    };
    
    fs.writeFileSync(filePath, JSON.stringify(d, null, 4), 'utf8');
    console.log(`Created: ${filePath}`);
});
