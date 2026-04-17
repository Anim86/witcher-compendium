import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const gifts = [
    {
        name: 'Minuscola Illusione',
        file: 'Minuscola Illusione.json',
        source: 'TC 74',
        res: '1 RES (Azione)',
        desc: '<p><strong>Effetto:</strong> con un’Azione, il personaggio crea un’illusione di un metro cubo di volume entro 4m da sé. È solo visiva e deve essere semplice.</p><p><strong>Effetti Collaterali:</strong> il personaggio subisce una penalità di -3 alle prove per determinare se un’illusione sia reale o no.</p>'
    },
    {
        name: 'Aura di Paura',
        file: 'Aura di Paura.json',
        source: 'TC 74',
        res: '1 RES (Azione)',
        desc: '<p><strong>Effetto:</strong> con un’Azione, il personaggio emette un’aura di paura quasi tangibile. Chi si trova entro 4m da lui deve superare una Prova di Resistere alla Magia CD 12 per non rimanere atterrito, subendo una penalità di -2 a tutte le azioni dirette contro il personaggio per ventiquattr’ore.</p><p><strong>Effetti Collaterali:</strong> il personaggio è considerato un livello più in basso sulla Tabella della Posizione Sociale (il minimo è Odiato) e per i membri della sua razza è Tollerato, invece di Eguale.</p>'
    },
    {
        name: 'Piedi Rapidi',
        file: 'Piedi Rapidi.json',
        source: 'TC 74',
        res: '1 RES (Azione)',
        desc: '<p><strong>Effetto:</strong> con un’Azione, il personaggio raddoppia la sua distanza di Balzo per un Round.</p><p><strong>Effetti Collaterali:</strong> quando viene gettato a terra, il personaggio scivola per 4m, aumentando la possibilità di urtare qualcosa.</p>'
    },
    {
        name: 'Calmare Animali',
        file: 'Calmare Animali.json',
        source: 'TC 74',
        res: '1 RES (Azione)',
        desc: '<p><strong>Effetto:</strong> con un’Azione, il personaggio calma una Bestia con Livello di Minaccia Facile. La creatura considera il personaggio e i suoi alleati come amici e non lo attacca se non viene provocata.</p><p><strong>Effetti Collaterali:</strong> le Bestie con Livello di Minaccia Medio o Difficile si infuriano in presenza del personaggio e, se possibile, lo attaccano ignorando altri avversari.</p>'
    },
    {
        name: 'Pigmento',
        file: 'Pigmento.json',
        source: 'TC 75',
        res: '1 RES (Azione)',
        desc: '<p><strong>Effetto:</strong> con un’Azione, il personaggio lascia un marchio di un colore a sua scelta, anche luminoso, su una superficie. Un marchio luminoso migliora l’illuminazione di un livello nel raggio di 4m (livello massimo Luce Diurna). Finché si trova entro 4m dal marchio, il personaggio può usare un’Azione per fare in modo che il simbolo mandi un lampo di Luce Accecante per un Round, dopo di che scompare.</p><p><strong>Effetti Collaterali:</strong> se qualcuno subisce un Disastro Magico entro 10m dal personaggio, anche questi ne è vittima. Se è lui stesso a subirlo, questo effetto non si applica.</p>'
    },
    {
        name: 'Pollice Verde',
        file: 'Pollice Verde.json',
        source: 'TC 75',
        res: '1 RES (Azione)',
        desc: '<p><strong>Effetto:</strong> con un’Azione, il personaggio può far crescere un seme fino a divenire una pianta adulta. Questo effetto funziona per erbe e piante medicinali, non per alberi.</p><p><strong>Effetti Collaterali:</strong> se il personaggio consuma un composto alchemico a base vegetale creato da lui stesso subisce la condizione Avvelenato, oltre al normale effetto.</p>'
    },
    {
        name: 'Aerocinesi',
        file: 'Aerocinesi.json',
        source: 'TC 75',
        res: '2 RES (Prova CD 9)',
        desc: '<p><strong>Effetto:</strong> utilizzando un Round, il personaggio può manipolare 5 ING di materiale fino a 8m di distanza, come se lo avesse in mano.</p><p><strong>Effetti Collaterali:</strong> quando viene gettato Prono, il personaggio è anche ridotto a RES 10, a meno che il suo valore non fosse già inferiore.</p>'
    },
    {
        name: 'Migliorare Arma',
        file: 'Migliorare Arma.json',
        source: 'TC 75',
        res: '2 RES (Prova CD 9)',
        desc: '<p><strong>Effetto:</strong> utilizzando un Round, il personaggio può conferire l’Effetto Sanguinamento (25%) a un’arma Tagliente o Perforante.</p><p><strong>Effetti Collaterali:</strong> il personaggio subisce automaticamente l’effetto Sanguinamento quando ne è bersaglio.</p>'
    },
    {
        name: 'Criocinesi',
        file: 'Criocinesi.json',
        source: 'TC 75',
        res: '2 RES (Prova CD 9)',
        desc: '<p><strong>Effetto:</strong> utilizzando un Round, il personaggio può congelare fino a due metri cubi di liquido o un singolo bersaglio entro 8m.</p><p><strong>Effetti Collaterali:</strong> Quando il personaggio è bersaglio di un effetto che lo renderebbe Congelato, non può resistere, ma invece delle normali penalità ciò riduce la sua VEL a 6 e i RIF a 4.</p>'
    },
    {
        name: 'Percepire Veleno',
        file: 'Percepire Veleno.json',
        source: 'TC 75',
        res: '2 RES (Prova CD 9)',
        desc: '<p><strong>Effetto:</strong> utilizzando un Round, il personaggio può annusare una sostanza e capire se è stata avvelenata.</p><p><strong>Effetti Collaterali:</strong> il personaggio subisce automaticamente gli effetti Avvelenato ed Ebbrezza quando ne è bersaglio. Inoltre, finché è sotto il loro effetto subisce anche Nausea.</p>'
    },
    {
        name: 'Fortificare',
        file: 'Fortificare.json',
        source: 'TC 75',
        res: '2 RES (Prova CD 9)',
        desc: '<p><strong>Effetto:</strong> utilizzando un Round, il personaggio aumenta di 1 l’Affidabilità o PR di un oggetto che tocca. Ogni oggetto può essere migliorato in questo modo solo una volta.</p><p><strong>Effetti Collaterali:</strong> se il personaggio si trova entro 4m da una qualsiasi quantità di Dimeritium, perde tutto il proprio Vigore e deve effettuare una Prova di Tempra con una penalità di -3 sulla Tabella del Dimeritium (Manuale Base pag. 167).</p>'
    },
    {
        name: 'Pirocinesi',
        file: 'Pirocinesi.json',
        source: 'TC 75',
        res: '2 RES (Prova CD 9)',
        desc: '<p><strong>Effetto:</strong> utilizzando un Round, il personaggio può accendere o spegnere un fuoco. Oppure dar fuoco a un bersaglio entro 8m. Non può usare questa capacità su sé stesso.</p><p><strong>Effetti Collaterali:</strong> il personaggio subisce automaticamente l’effetto A Fuoco (Manuale Base pag. 161) quando ne è bersaglio.</p>'
    },
    {
        name: 'Vedere Aura',
        file: 'Vedere Aura.json',
        source: 'TC 75',
        res: '2 RES (Prova CD 9)',
        desc: '<p><strong>Effetto:</strong> utilizzando un Round, il personaggio percepisce l’aura di tutte le creature entro 8m da lui. Ciò gli permette di conoscere la Soglia di Vigore di ciascuna di esse.</p><p><strong>Effetti Collaterali:</strong> chi tocca il personaggio sente un prurito che indica la presenza di magia. Ciò spinge la gente a credere che sia un Mago e la sua Posizione Sociale cambia di conseguenza.</p>'
    },
    {
        name: 'Geocinesi',
        file: 'Geocinesi.json',
        source: 'TC 75',
        res: '2 RES (Prova CD 9)',
        desc: '<p><strong>Effetto:</strong> utilizzando un Round, il personaggio fa tremare la terra nel raggio di 8m intorno a sé. Chi si trova in quest’area deve superare una Prova di Atletica CD 14 per non cadere Prono ed essere Vacillante.</p><p><strong>Effetti Collaterali:</strong> quando subisce l’effetto Vacillante, il personaggio resta invece Stordito per un Round.</p>'
    }
];

const dir = '_tools/src-packs/MAGIA/caos/witcher-gifts';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

gifts.forEach(g => {
    const filePath = path.join(dir, g.file);
    const id = crypto.randomBytes(8).toString('hex');
    const json = {
        name: g.name,
        type: 'item',
        img: `modules/witcher-compendium/assets/MAGIA/caos/witcher-gifts/${g.name.replace(/ /g, '_')}.webp`,
        system: {
            sourcebook: g.source,
            description: g.desc,
            stats: {
                cost: g.res
            }
        },
        _id: id,
        _stats: {
            systemId: 'TheWitcherItaNewSystem',
            coreVersion: 14
        }
    };
    fs.writeFileSync(filePath, JSON.stringify(json, null, 4), 'utf8');
    console.log(`Created ${g.file} with ID ${id}`);
});
