const fs = require('fs');
const path = require('path');

const packDir = `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-dlc-sr-lore`;

const updates = {
    "Peculiarità delle Locande": `<p>Ogni locale del Continente è unico e ha le proprie peculiarità distintive. Tirare 2d6 per scoprire di che si tratta o inventarne una propria!</p><table><tr><th>2d6</th><th>Peculiarità</th></tr><tr><td>2</td><td>Pietre del potere incastonate che creano temporanee illusioni.</td></tr><tr><td>3</td><td>Uno strano animale domestico, come un mostro o una creatura insolita.</td></tr><tr><td>4</td><td>I proprietari appartengono alle Razze Antiche.</td></tr><tr><td>5</td><td>L'insegna sopra l'ingresso è molto osé.</td></tr><tr><td>6</td><td>Il menestrello del locale è davvero pessimo.</td></tr><tr><td>7</td><td>Una sera ogni mese, nel locale si tiene un evento all-you-can-drink a prezzo politico.</td></tr><tr><td>8</td><td>Il locale ospita l'annuale torneo di Gwent della regione.</td></tr><tr><td>9</td><td>C'è uno strano odore che non va mai via.</td></tr><tr><td>10</td><td>A ogni tavolo c'è un campanello per chiamare il personale.</td></tr><tr><td>11</td><td>Alle pareti sono appesi strani ricordi e oggetti.</td></tr><tr><td>12</td><td>Un mostro o strano animale impagliato.</td></tr></table>`,
    
    "Tipi di Locali e Taverne": `<p>Esistono molti tipi di locali, ma questi cinque sono i più comuni nel Continente.</p><ul><li><strong>I bordelli</strong> sono locali dove i clienti fanno sesso con il personale. Di solito sono gestiti da una Matrona, che supervisiona le attività quotidiane e l'amministrazione.</li><li><strong>I club</strong> sono locali privati o semi-privati, spesso un incrocio tra taverne e bordelli, dove l'ingresso è riservato, di solito a chi conosce una parola l'ordine o ha un segno di riconoscimento.</li><li><strong>Le locande di posta</strong> si trovano lungo le strade, nei luoghi più remoti o ai margini delle città. Molte sono fortificate e offrono numerosi servizi, come la cura dei cavalli o un maniscalco.</li><li><strong>Gli ostelli</strong> sono l'alternativa economica alle locande e, di solito, si trovano nelle città più grandi. Sono molto spartani, ma costano poco e i proprietari non fanno domande.</li><li><strong>Le taverne</strong> sono locali dove si beve e in molte, a seconda delle leggi locali, si gioca d'azzardo.</li></ul><p>Tirare 1d6 per determinare il tipo di locale.</p><table><tr><th>1d6</th><th>Tipo di Locale</th></tr><tr><td>1</td><td>Bordello</td></tr><tr><td>2</td><td>Club</td></tr><tr><td>3-4</td><td>Locanda di Posta</td></tr><tr><td>5</td><td>Ostello</td></tr><tr><td>6</td><td>Taverna</td></tr></table>`,
    
    "Strade e Distanze del Continente": `<p>A volo d'uccello, tra Vizima e Novigrad ci sono 300km di terreno regolare, ma la strada migliore non prevedere di dirigersi direttamente a ovest, ma di seguire il fiume verso nord, finché non si getta nel Pontar e da lì proseguire lungo la valle fino al mare. È una strada più lunga, ma nota e trafficata, che evita di attraversare gli acquitrini e di dover guadare il Pontar. A cavallo richiede circa sette giorni.</p><p>Da Cidaris a Cintra ci sono 400km, ma il percorso più diretto richiede di attraversare il Verden ed evitare la Foresta di Brokilon a est. Verden è un territorio paludoso e l'attuale epidemia rende il viaggio ancora più difficile. Un'alternativa è procedere via mare, dato che si tratta di città portuali. Il rischio è venire assaliti dai pirati Skelliger, ma si evita di restare impantanati, venire divorati dai Drowner o di prendersi una malattia mortale. Il viaggio richiede una settimana a cavallo o da sette a dieci giorni via mare, a seconda del clima.</p><p>La strada più diretta da Pont Vanis a Creyden richiede una settimana a cavallo, ma è più semplice seguire la costa verso sud e risalire il Fiume Gwidyr, che scende dai Monti del Drago e attraversa Creyden. Il letto del fiume è più regolare del territorio lungo la via diretta, per cui con un veicolo i tempi di viaggio sono quasi gli stessi.</p>`
};

let report = [];

if (fs.existsSync(packDir)) {
    const files = fs.readdirSync(packDir).filter(f => f.endsWith('.json'));
    
    files.forEach(f => {
        const fullPath = path.join(packDir, f);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const name = data.name;
    
        if (updates[name]) {
            if (!data.system) data.system = {};
            data.system.description = updates[name];
            fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), 'utf8');
            const packName = path.basename(packDir);
            report.push(`[${packName}] [${name}] — STATO: Aggiornato`);
        }
    });
}

fs.writeFileSync('e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\update_report_6.txt', report.join('\n'), 'utf8');
