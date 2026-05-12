const fs = require('fs');
const path = require('path');

const baseDir = `e:\\AntigravitiProgetti\\CompendioTheWitcher\\_tools\\src-packs\\REGOLAMENTO_E_NARRATIVA\\Lore_e_Racconti\\witcher-lore`;

const updates = {
    "Accademia di Ban Ard": "BAN ARD L’Accademia di Ban Ard si trova nell’omo- nima città del regno di Kaedwen. Pur non essendo controllata dalla corona, Ban Ard è influenzata dall’energia selvaggia, dai costumi e dal clima inospitale di questa nazione, sem- pre in conflitto con i vicini. A differenza di quanto avviene ad Aretuza e Gweison Haul, gli studenti (tutti maschi) non sono isolati dal mondo esterno. L’accademia ha sede appena fuori dalla città, in un imponente edificio di pietra, e non è insolito che gli studenti passino del tempo tra la gente comune. Chi è qui da più tempo si diverte a bere, socializzare e go- dersi tutti i piaceri che Ban Ard offre ai giova- ni ricchi. Infatti, a causa della retta onerosa e della preferenza per il sangue blu, vi sono inte- re classi formate solo da figli dell’aristocrazia. Questo lassismo generale (“Sono solo ragaz- zi...”) porta a una notevole carenza di discipli- na, nonostante l’espulsione sia assolutamente contemplata in alcuni casi. Per esempio, i piccoli furti sono puniti molto severamente, mentre spesso viene chiuso un occhio sugli ol- traggi alla decenza da parte di chi ha appena superato un esame. In accordo con la cultura della regione, gli studenti di Ban Ard sono incoraggiati ad affi- nare anche le proprie capacità marziali, per cui le classi più avanzate spesso partecipano a cacce ai mostri o a spedizioni mercenarie. Ciò viene considerato l’equivalente di un tirocinio finan- ziato dall’accademia, che si prende una fetta di ogni eventuale compenso. Tutto ciò aggrava la mancanza di attenzione agli studi magici quoti- diani. I ragazzi di Ban Ard non sono sottoposti alla pressione costante delle colleghe di Aretuza. Il risultato è che, nelle regolari competizioni tra le due scuole, Aretuza domina. Alcuni ritengo- no che il motivo sia da ricercare nel fatto che gli studenti di Ban Ard sono troppo ambiziosi o desiderosi di primeggiare, mentre le ragazze di Aretuza conoscono meglio i propri limiti e capacità, per cui studiano con maggiore atten- zione la teoria magica. A causa della mancanza di pressione mol- ti studenti non finiscono gli studi, anche se ciò potrebbe essere dovuto alle opportunità concesse loro. Per le donne, il successo acca- demico è spesso l’unico mezzo per ottenere una posizione di potere, mentre i ragazzi han- no molte altre occasioni, persino quando non completano gli studi. Un mago di scarse capa- cità può avere successo in mestieri comuni o farsi pagare una fortuna per usare i suoi scarsi poteri, certo di non dover mai affrontare un collega pienamente addestrato. Inoltre, Ban Ard ospita molti club o società segrete, dove i giovani ricchi stringono legami che li aiute- ranno anche dopo aver lasciato la scuola.",
    "Confraternita dei Maghi": "La prima organizzazione d’incantatori fu la Confraternita dei Maghi, nell’VIII secolo. Il suo organo dirigente era il Conclave, che tentò di riunire tutti i maghi sotto un unico codice di condotta. Questo diede il via a una guerra civile tra maghi. Al termine del conflitto, un’organizza- zione parallela si affiancò alla Confraternita: il Supremo Consiglio, che si occupava prin- cipalmente di sperimentazione e ricerche ma- giche. In seguito venne fondato il Capitolo, come camera alta del Conclave, dotato di un’autorità superiore.",
    "Kaer Morhen": "Antica fortezza sede della Scuola del Lupo, situata tra i Monti Blu. Gli addestramenti che vi si svolgono sono difficili ma ben strutturati, coprendo ogni aspetto della professione del witcher: dalla tecnica di combattimento alla conoscenza dei mostri.",
    "Isola di Thanedd": "Isola situata a nordovest di Gors Velen, sede dell'accademia di magia femminile di Aretuza. È tristemente nota per essere stata il teatro della Rivolta di Thanedd, evento che cambiò per sempre i rapporti tra i maghi e i sovrani del Nord.",
    "Scuola di Aretuza": "Accademia di magia situata sull'isola di Thanedd, a nordovest di Gors Velen. Riservata alle studentesse, è considerata la più rigorosa e prestigiosa scuola di magia del continente, con risultati sistematicamente superiori rispetto alle accademie maschili come Ban Ard."
};

let report = [];

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.json'));

files.forEach(f => {
    const fullPath = path.join(baseDir, f);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const name = data.name;

    if (updates[name]) {
        if (!data.system) data.system = {};
        // Wrap with <p> for Foundry VTT rendering
        data.system.description = `<p>${updates[name]}</p>`;
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), 'utf8');
        report.push(`[witcher-lore] [${name}] — STATO: Aggiornato`);
    } else {
        // Just log those explicitly requested to be untouched or naturally untouched
        // The prompt says "Nessuna modifica alle voci: Niya (Lilit), San Gregory, Valle del Pontar — lasciarle invariate."
        if (["Niya (Lilit)", "San Gregory", "Valle del Pontar"].includes(name)) {
             report.push(`[witcher-lore] [${name}] — STATO: Invariato`);
        }
    }
});

fs.writeFileSync('e:\\AntigravitiProgetti\\CompendioTheWitcher\\scratch\\update_specific_log.txt', report.join('\n'), 'utf8');
