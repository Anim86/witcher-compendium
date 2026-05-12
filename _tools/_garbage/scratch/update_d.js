const fs = require('fs');
const path = require('path');

const baseDirs = [
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore`,
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore-chaos`,
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore-racconti`,
    `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-dlc-sr-lore`
];

const updates = {
    "Lore: Linee Geomantiche — Definizione": "<p>Le Linee Geomantiche sono sentieri di magia invisibili e semi-intangibili che attraversano il mondo. Dove si intersecano, la magia è più potente, tanto che gli antichi elfi vi eressero dei monoliti, divenuti noti come Luoghi di Potere. Per quanto ogni Linea Geomantica sia una fonte d'energia, molti incantatori preferiscono sfruttare i Luoghi di Potere, perché risultano assai più stabili. Maghi, preti e druidi possono comunque usare le Linee per rafforzare i propri poteri, ma farlo in modo eccessivo o improprio è assai pericoloso. Nonostante siano larghe circa 6m e lunghe centinaia di chilometri, le Linee Geomantiche sono assai difficili da individuare, essendo per natura invisibili e non del tutto tangibili. Ogni personaggio legato alla magia sente un crampo all'anulare quando si trova entro 10m da una Linea. Dopo di che, un Mago può impiegare Arte del Mago per definire con precisione posizione e direzione della Linea. La presenza di una Linea provoca inoltre piccoli cambiamenti nel territorio circostante: rocce disposte in modi strani, frequenti mulinelli di polvere o umidità innaturale sono segnali della sua vicinanza.</p>",
    "Lore: Linee Geomantiche — Elemento Acqua": "<p>Elemento: Acqua. Segnali: Umidità innaturale, ruscelli, onde anomale. Benefici: Chi lancia magie d'acqua da una Linea Geomantica considera la propria Abilità di Lanciare Incantesimi 2 punti più alta. Penalità Aggiuntive: Il Mago soffre di vivide allucinazioni, scelte dal GM, che durano fino a un minuto dopo che si è scollegato dalla Linea.</p>",
    "Lore: Linee Geomantiche — Elemento Aria": "<p>Elemento: Aria. Segnali: Frequenti mulinelli di polvere, cirri, odore di ozono. Benefici: Chi usa la magia dell'aria presso una Linea Geomantica può lanciare qualsiasi Incantesimo d'aria come se lo avesse appreso. Ciò non gli conferisce alcuna vera conoscenza di tale incantesimo e, una volta interrotta la connessione, non potrà insegnarlo ad altri né trascriverlo. Penalità Aggiuntive: La magia viene lanciata lo stesso, ma il GM ne sostituisce l'effetto con quello di un altro Incantesimo d'aria. Il Mago deve comunque pagare il costo in RES dell'effetto originale.</p>",
    "Lore: Linee Geomantiche — Elemento Fuoco": "<p>Elemento: Fuoco. Segnali: Piante avvizzite, foschia da calore, sole accecante. Benefici: Chi lancia una magia di fuoco da una Linea Geomantica somma +2 al danno inflitto dagli incantesimi offensivi, che ottengono una probabilità del 100% di dare fuoco al bersaglio. Penalità Aggiuntive: Il Mago è obbligato a spendere RES aggiuntiva per lanciare di nuovo lo stesso incantesimo contro un bersaglio casuale.</p>",
    "Lore: Linee Geomantiche — Elemento Terra": "<p>Elemento: Terra. Segnali: Crescita anomala di piante, alberi contorti, pietre disposte in modo strano. Benefici: Chi è bersaglio di una magia di terra lanciata presso la Linea Geomantica subisce una penalità -4 per difendersi da essa. Penalità Aggiuntive: Il collegamento alla Linea viene interrotto e la CD per ripristinarlo è di 2 punti più alta.</p>",
    "Lore: Linee Geomantiche — Preti e Druidi": "<p>Elemento: Misto. Benefici: Chi lancia una magia da una Linea Geomantica aumenta di 4 la propria Soglia di Vigore. Penalità Aggiuntive: L'incantatore riduce la propria Soglia di Vigore di 2 per sei ore. Per ogni ulteriore Disastro o Sovraffaticamento, la penalità aumenta di altri 2 punti. Se il Vigore viene ridotto a 0 o meno, l'incantatore perde la capacità di usare la magia finché il punteggio non risale.</p>",
    "Lore: Linee Geomantiche — Trarre Potere": "<p>Una volta entrato in contatto fisico con una Linea Geomantica, un mago, un prete o un druido può impiegare un'Azione per trarne potere, superando una Prova di Lanciare Incantesimi CD 16. In caso di successo, l'incantatore sblocca il potere della Linea e può sfruttarlo finché resta in contatto fisico con essa. Se si allontana, la connessione si interrompe e occorre ripristinarla una volta rientrati in contatto. Chi fallisce subisce immediatamente un Disastro Elementale del tipo appropriato, senza danni aggiuntivi. Mentre è connesso a una Linea, un Mago può impiegare solo Incantesimi dell'elemento della stessa; Preti e Druidi invece possono usare le loro Invocazioni liberamente. Witcher e altri incantatori possono tentare di trarre potere da una Linea, ma raramente hanno l'addestramento necessario per avere successo.</p>",
    "Lore: Luoghi di Potere": "<p>Creare un Luogo di Potere richiede di incidere complessi sigilli su un menhir posto alla confluenza di due Linee Geomantiche del medesimo elemento. Una volta completato, il Luogo di Potere rimarrà attivo permanentemente. Il rituale ha un costo di 18 RES, richiede 20 Round di preparazione e una Prova con CD 20. I componenti necessari sono 20 sassi e utensili da incisore runico. Ottenere un disastro nell'esecuzione causa un effetto di livello 10 e tutte le rocce utilizzate esplodono come una bomba, causando 7d6 danni a tutto ciò che si trova nel raggio di 6m.</p>",
    "Lore: Redigere uno Scritto (Introduzione TC)": "<p>Il Tomo del Caos è un'opera nata dalla collaborazione tra Brandon di Oxenfurt, celebre storico, e Glynnis var Treharne, ex-direttrice dell'accademia di Gweison Haul. Glynnis, maga elfa di origini Nilfgaardiane, aveva abbandonato il suo paese incapace di tollerarne il sistema oppressivo e la politica espansionista. Convinta che rendere la conoscenza magica più accessibile avrebbe allentato le restrizioni imposte ai maghi nel Sud, propose a Brandon di riunire in un solo volume le conoscenze magiche del Nord e del Sud. Il mercante Rodolf Kazmer fece da tramite tra i due. L'opera raccoglie informazioni veritiere sulla magia, con il contributo di molti che fornirono notizie di prima mano o prestarono tomi dimenticati.</p>"
};

let report = [];

baseDirs.forEach(baseDir => {
    if (!fs.existsSync(baseDir)) return;
    const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.json'));
    
    files.forEach(f => {
        const fullPath = path.join(baseDir, f);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const name = data.name;
    
        if (updates[name]) {
            if (!data.system) data.system = {};
            data.system.description = updates[name];
            fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), 'utf8');
            const packName = path.basename(baseDir);
            report.push(`[${packName}] [${name}] — STATO: Aggiornato`);
        }
    });
});

fs.writeFileSync('e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\update_report_4.txt', report.join('\n'), 'utf8');
