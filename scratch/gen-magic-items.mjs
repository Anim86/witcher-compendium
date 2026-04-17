import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dir = '_tools/src-packs/EQUIPAGGIAMENTO/caos/witcher-magic-items';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const items = [
    {
        name: 'Amuleto Incantato',
        type: 'valuable',
        source: 'TC ', // Will append page later
        desc: '<p>Gli Amuleti Incantati sono realizzati da maghi e maghe come riserve di magia e come mezzo per lanciare incantesimi superiori alle loro capacità. Ogni Amuleto è un Focus (2) e il creatore vi può infondere la capacità di lanciare fino a quattro incantesimi. Questi impiegano la Resistenza del portatore, che deve possedere un punteggio di Vigore sufficiente a lanciare la magia. Preti e druidi possono usare questi oggetti per lanciare incantesimi come se fossero maghi.</p><p><em>Istruzione CD 14</em></p>'
    },
    {
        name: 'Portale Fisso',
        type: 'valuable',
        desc: '<p>I Portali Fissi sono un antico sistema di trasporto, usato in passato dagli elfi. Funzionano come l’incantesimo Portale, ma collegano direttamente due punti fissi. Molte di queste strutture richiedono una chiave di attivazione (come una parola d’ordine o piccole gemme dette “Pietre del Potere”) che l’utilizzatore deve avere con sé.</p><p><em>Istruzione CD 18</em></p>'
    },
    {
        name: 'Specchio dei Desideri',
        type: 'valuable',
        desc: '<p>Questi specchi mostrano alle persone i loro più grandi desideri. Ognuno vede ciò che ha sempre sognato di essere, il proprio riflesso idealizzato. Nel farlo, però, cade in una sorta di trance... Dopo essersi guardato una volta, un personaggio deve effettuare una prova di Resistere alla Magia CD 18. Se fallisce, dovrà guardarsi nello specchio per almeno un’ora ed effettuare un’altra prova.</p><p><em>Istruzione CD 16</em></p>'
    },
    {
        name: 'Formula Magica',
        type: 'valuable',
        desc: '<p>Queste istruzioni conferiscono +2 alle prove necessarie ad apprendere un particolare Incantesimo, Invocazione, Fattura, Segno o Rituale.</p><p><em>Istruzione CD 14</em></p>'
    },
    {
        name: 'Teschio di Cristallo',
        type: 'valuable',
        desc: '<p>Un vero teschio animale cristallizzato e permeato di magia. Con un comando, l’oggetto diventa l’animale originale (cane, gatto, uccello o serpente), che ubbidisce agli ordini mentali del personaggio finché si trova entro 50m da lui. Se muore, ritorna ad essere un teschio, che può essere ricaricato usando il rituale Creare Teschio di Cristallo.</p><p><em>Istruzione CD 16</em></p>'
    },
    {
        name: 'Occhio di Nehaleni',
        type: 'valuable',
        desc: '<p>Tavolette di pietra rotonde che permettono di dissipare le illusioni invocando la dea Nehaleni. Richiede un’Azione e una prova di Lanciare Incantesimi con un bonus di +4, contrapposta a quella usata per creare l’illusione. Con un successo l’illusione scompare (nessuna spesa di RES).</p><p><em>Istruzione CD 16</em></p>'
    },
    {
        name: 'Corda Elfica Magica',
        type: 'valuable',
        desc: '<p>Queste corde bianche strettamente intrecciate sono infuse di magia e possono muoversi secondo la volontà del loro possessore. Conferiscono un bonus di +5 alle prove di Atletica per arrampicarsi, possono sopportare 300kg e subire fino a 50 danni.</p><p><em>Istruzione CD 18</em></p>'
    },
    {
        name: 'Quadrifoglio',
        type: 'valuable',
        desc: '<p>Un quadrifoglio conferisce un Punto Fortuna temporaneo, che può essere speso, senza bisogno di un’Azione, per ottenere +1 alla propria prova successiva. Una volta fatto, si disintegra.</p><p><em>Istruzione CD 10</em></p>'
    },
    {
        name: 'Utensili da Incisore Runico',
        type: 'valuable',
        desc: '<p>Sono necessari per realizzare le Parole Runiche o i Glifi. Inoltre, incidere una Runa o un Glifo con questi strumenti (richiede mezz’ora), conferisce dei bonus aggiuntivi descritti in TC Pag 122.</p><p><em>Istruzione CD 16</em></p>'
    },
    {
        name: 'Megascopio',
        type: 'valuable',
        desc: '<p>Complesso dispositivo che concentra il potere del mago per lanciare incantesimi a grande distanza (Portali/Teletrasporto) e comunicare. Un Megascopio deve essere collocato in un cerchio su una superficie piana e attivato da chi ha almeno Vigore 1.</p><p><em>Istruzione CD 14</em></p>'
    },
    {
        name: 'Pietra Guardiana: Allarme',
        type: 'valuable',
        desc: '<p>Quando una creatura non sintonizzata arriva entro 6m dalla pietra, questa invia un messaggio telepatico a tutti coloro con cui è sintonizzata. Segnala solo la presenza dell’intruso.</p><p><em>Istruzione CD 16</em></p>'
    },
    {
        name: 'Pietra Guardiana: Arco',
        type: 'valuable',
        desc: '<p>Quando una creatura non sintonizzata arriva entro 6m, la pietra attacca con una Base di Abilità di 10, scagliando un fulmine (2d6 danni). La pietra scaglia un fulmine a Round finché gli intrusi non si allontanano.</p><p><em>Istruzione CD 16</em></p>'
    },
    {
        name: 'Pietra Guardiana: Illusione',
        type: 'valuable',
        desc: '<p>Quando una creatura non sintonizzata arriva entro 2m, la Pietra crea entro 10m l’illusione di una guardia. L’effetto dura 8 ore o finché non viene dissipato.</p><p><em>Istruzione CD 16</em></p>'
    },
    {
        name: 'Legame di Coppia',
        type: 'valuable',
        desc: '<p>Anelli d’argento collegati magicamente (venduti a coppie). Ruotandone uno è possibile inviare un breve messaggio (20 parole) all’altro. L’anello vibra quando il gemello è in pericolo mortale.</p><p><em>Istruzione CD 16</em></p>'
    }
];

items.forEach(item => {
    const id = crypto.randomBytes(8).toString('hex');
    const safeName = item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filePath = path.join(dir, `${safeName}_${id}.json`);
    
    const d = {
        _id: id,
        name: item.name,
        type: item.type,
        img: `modules/witcher-compendium/assets/EQUIPAGGIAMENTO/caos/witcher-magic-items/${safeName}.webp`,
        system: {
            description: item.desc,
            sourcebook: 'TC 119'
        },
        _stats: {
            systemId: "TheWitcherItaNewSystem",
            coreVersion: 14
        }
    };
    
    fs.writeFileSync(filePath, JSON.stringify(d, null, 4), 'utf8');
    console.log(`Created: ${filePath}`);
});
