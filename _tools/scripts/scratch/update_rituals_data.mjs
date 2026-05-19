import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const RITUALS_DIR = path.join(REPO_ROOT, '_tools', 'src-packs', 'MAGIA_E_MALEDIZIONI', 'Incantesimi_e_Rituali', 'witcher-rituals');

// Robust structured data mapping
const RITUALS_DATA = [
    {
        file: "ciondolo_di_wagerer_71019f819cc849db.json",
        name: "Ciondolo di Wagerer",
        level: "novice",
        difficultyCheck: "14",
        stamina: 6,
        duration: "1 Settimana",
        components: "Aconito (x2), Acquaforte (x5), Ceneri (x2), Cuoio (x2), Gessetto (x2), Ossa di Bestia (x1)",
        effect: "Crea un ciondolo che assorbe temporaneamente le Fatture scagliate su chi lo indossa. Se non vengono rimosse, si spezza liberando la magia oscura su tutti entro 2m"
    },
    {
        file: "creare_teschio_di_cristallo_001acd2273064baf.json",
        name: "Creare Teschio di Cristallo",
        level: "novice",
        difficultyCheck: "15",
        stamina: 5,
        duration: "Permanente",
        components: "Teschio di animale (x1), Quintessenza (x2), Vetro (x2)",
        effect: "(Dato Integrato) Crea un teschio fluttuante infuso di magia che funge da spia e proietta immagini e suoni al suo creatore."
    },
    {
        file: "idromanzia_0e058f4469d14c2f.json",
        name: "Idromanzia",
        level: "novice",
        difficultyCheck: "15 (18)",
        stamina: 5,
        duration: "Attiva (2)",
        components: "Ciotola/Specchio d'acqua, Quintessenza (x2), Petali Mirto (x2), Perla (x2), Frammento Lunare (x1), Berbercane (x1)",
        effect: "Scorge nell'acqua un evento avvenuto negli ultimi due giorni o in corso. I maghi osservati possono percepire la divinazione"
    },
    {
        file: "infondere_trofeo_fc30eef8f5244027.json",
        name: "Infondere Trofeo",
        level: "novice",
        difficultyCheck: "14",
        stamina: 3,
        duration: "Istantanea",
        components: "Trofeo di Mostro (x1), Cerume di Orco (x1), Erbe da Concia (x10), Grasso Estere (x2), Polvere Infusa (x1), Quintessenza (x1)",
        effect: "Consente di sfruttare la fisiologia di un mostro morto per incanalare la magia, creando un Trofeo che conferisce bonus a chi l'ha ucciso"
    },
    {
        file: "messaggio_magico_166789dd069a4ea2.json",
        name: "Messaggio Magico",
        level: "novice",
        difficultyCheck: "12",
        stamina: 3,
        duration: "Permanente",
        components: "Vetro o Gemma (x1), Quintessenza (x1), Soluzione di Mercurio (x1)",
        effect: "Registra un messaggio di max 5 minuti in una gemma/vetro che si attiva in base a 3 condizioni impostate, proiettando un'illusione di chi parla"
    },
    {
        file: "piromanzia_40dbcd89a1d6480b.json",
        name: "Piromanzia",
        level: "novice",
        difficultyCheck: "15",
        stamina: 5,
        duration: "Attiva (4)",
        components: "Piccolo falò, Quintessenza (x2), Cenere (x2), Calcium Equum (x5), Occhio Corvo (x2), Cera (x2)",
        effect: "Permette di scrutare nelle fiamme per scorgere un evento che sta avvenendo in quel momento (ma non nel passato)"
    },
    {
        file: "Rituale_della_Magia_55e57065785e426b.json",
        name: "Rituale della Magia",
        level: "novice",
        difficultyCheck: "15",
        stamina: 3,
        duration: "1 utilizzo",
        components: "Gesso (x2), Vetro (x2), Zolfo (x2), Polvere Infusa (x1)",
        effect: "Crea un cerchio che conferisce alla prima persona dotata di magia che vi entra un bonus alla Soglia di Vigore per 5 ore"
    },
    {
        file: "Rituale_della_Vita_bfdbf167dce24b07.json",
        name: "Rituale della Vita",
        level: "novice",
        difficultyCheck: "15",
        stamina: 5,
        duration: "1 utilizzo",
        components: "Gessetto (x2), Cenere (x2), Cera (x2), Radice Mandragora (x2)",
        effect: "Crea un cerchio in cui le cure sono amplificate. Chi vi entra rigenera 3 PS per turno per un massimo di 10 round"
    },
    {
        file: "Rituale_Purificatore_0c756bc90cd84b1a.json",
        name: "Rituale Purificatore",
        level: "novice",
        difficultyCheck: "Var.",
        stamina: 3,
        duration: "Istantanea",
        components: "Gessetto (x2), Alcolico (x1), Vischio (x2), Occhio Corvo (x1), Foglia Balissa (x1)",
        effect: "Purifica il bersaglio da droghe/alcol (CD 12), veleni/pozioni (CD 15) o malattie gravi (CD 18)"
    },
    {
        file: "seduta_spiritica_66b53304ae614932.json",
        name: "Seduta Spiritica",
        level: "novice",
        difficultyCheck: "12",
        stamina: 5,
        duration: "Permanente",
        components: "Sangue defunto/parente, Radice Mandragora (x1), Fungo Sewant (x2), Aconito (x2), Zolfo (x2)",
        effect: "Evoca lo spirito intelligente di un defunto nel luogo della sua sepoltura per potergli parlare senza poterlo allontanare se non distruggendolo"
    },
    {
        file: "telecomunicazione_78b3dac93ae141f6.json",
        name: "Telecomunicazione",
        level: "novice",
        difficultyCheck: "Ness.",
        stamina: 3,
        duration: "1 Ora",
        components: "Un Telecomunicatore",
        effect: "Mette in contatto telepatico l'utilizzatore con chiunque possieda un altro Telecomunicatore, in ogni parte del Continente"
    },
    {
        file: "tiromanzia_7f6be1a2142c4af5.json",
        name: "Tiromanzia",
        level: "novice",
        difficultyCheck: "14",
        stamina: 2,
        duration: "Istantanea",
        components: "Formaggio stagionato (x1), Coltello (x1)",
        effect: "(Dato Integrato) Permette, esaminando consistenza e odore del formaggio infuso magicamente, di porre semplici domande con risposte affermative o negative."
    },
    {
        file: "vaso_d_incantesimi_6ceef369efb84351.json",
        name: "Vaso d'Incantesimi",
        level: "novice",
        difficultyCheck: "15",
        stamina: 5,
        duration: "1d6 Giorni",
        components: "Argilla (x5), Quintessenza (x1), Filo (x2), Gessetto (x1), Cera (x1), Fibra Han (x2), Polvere Infusa (x1)",
        effect: "Chiude un vortice magico in un vaso. Quando viene rotto, scatena casualmente un incantesimo ambientale tra: Prigione Talfryn, Zefiro, Tanio Ilchar, Nebbia Dormyn, Tempesta Statica"
    },
    {
        file: "animare_armatura_ba5d67e658aa46b7.json",
        name: "Animare Armatura",
        level: "journeyman",
        difficultyCheck: "18",
        stamina: 14,
        duration: "Permanente",
        components: "Armatura Completa, Cuore di Golem (x1), Quintessenza (x3), Polvere Infusa (x2)",
        effect: "(Dato Integrato) Trasforma una normale corazza a piastre in un Costrutto animato che obbedisce ai comandi del ritualista."
    },
    {
        file: "barriera_magica_6f95a8d8ab5e496b.json",
        name: "Barriera Magica",
        level: "journeyman",
        difficultyCheck: "18",
        stamina: 10,
        duration: "Attiva (2)",
        components: "Quintessenza (x5), Polvere Infusa (x2), Gessetto (x4)",
        effect: "Crea una bolla impenetrabile di 10m di diametro con 50 PS. Se desiderato, blocca anche il ricambio d'aria"
    },
    {
        file: "consacrare_d9cee7de73c443c5.json",
        name: "Consacrare",
        level: "journeyman",
        difficultyCheck: "18",
        stamina: 10,
        duration: "Permanente",
        components: "Quintessenza (x5), Polvere Infusa (x2), Gessetto (x4), Argento o Meteorite (x5)",
        effect: "Crea un cerchio repulsivo (fino a 10m). I mostri che tentano di passare devono battere il lancio del Rituale in una prova di Resistere alla Magia o subire danni ed essere respinti"
    },
    {
        file: "faro_dell_innaturale_63674c6182df4da2.json",
        name: "Faro dell'Innaturale",
        level: "journeyman",
        difficultyCheck: "18",
        stamina: 12,
        duration: "Permanente",
        components: "Mutageno (x1), Legname Indurito (x4), Ossa di Bestia (x5), Quintessenza (x1)",
        effect: "Crea un macabro totem d'ossa che richiama inesorabilmente i mostri nel raggio di 1,6km affinché facciano il nido nei pressi. Il raggio si allarga ogni anno."
    },
    {
        file: "nebbia_del_passato_233351ef85964db9.json",
        name: "Nebbia del Passato",
        level: "journeyman",
        difficultyCheck: "18",
        stamina: 10,
        duration: "20 Minuti",
        components: "Candele (x5), Essenza di Wraith (x2), Frammenti Lunari (x1), Vetro (x5)",
        effect: "Produce un proiettore in vetro che mostra a ciclo continuo (in loop di 5 minuti) l'evento emotivamente più potente mai avvenuto in quel luogo"
    },
    {
        file: "Oniromanzia_3f837cb1be7b4b06.json",
        name: "Oniromanzia",
        level: "journeyman",
        difficultyCheck: "15 (18)",
        stamina: 8,
        duration: "1d10 Round",
        components: "Un posto dove dormire",
        effect: "Genera sogni rivelatori per il passato o presente/futuro. Permette di trasportare nel sogno altre persone rispondendo a domande personali"
    },
    {
        file: "registro_magico_degli_ospiti_377230655e414158.json",
        name: "Registro Ospiti",
        level: "journeyman",
        difficultyCheck: "18",
        stamina: 10,
        duration: "1 Giorno",
        components: "Argilla (x1), Carbone (x2), Gessetto (x2), Quintessenza (x1)",
        effect: "Piazza una cortina invisibile su una porta. Registra il volto di tutti coloro che passano e permette al ritualista (entro 100m) di consultarli mentalmente"
    },
    {
        file: "compressione_in_manufatto_037a93ed3118473e.json",
        name: "Compressione",
        level: "master",
        difficultyCheck: "18",
        stamina: 16,
        duration: "Fino Invers.",
        components: "Gemma Perfetta (x1), Quintessenza (x5), Polvere Infusa (x2), Argilla (x4)",
        effect: "Rimpicciolisce violentemente il bersaglio a 1/10 della sua stazza rinchiudendolo in una statuina di giada (subisce enormi danni fisici se fallisce il TS Tempra)"
    },
    {
        file: "costruire_golem_259c6a8a6cc1490f.json",
        name: "Costruire Golem",
        level: "master",
        difficultyCheck: "20",
        stamina: 15,
        duration: "Permanente",
        components: "Argilla o Pietra (x10), Quintessenza (x5), Polvere Infusa (x2), Cuore di Golem o Mutageno (x1)",
        effect: "(Dato Integrato) Fabbrica un Golem elementale totalmente sottomesso e privo di libero arbitrio che esegue alla lettera gli ordini impartiti."
    },
    {
        file: "creare_luogo_di_potere_d12a8d75cc4c4de4.json",
        name: "Creare Luogo Potere",
        level: "master",
        difficultyCheck: "22",
        stamina: 20,
        duration: "Permanente",
        components: "Grande Pietra/Menhir, Polvere di Meteorite (x5), Polvere Infusa (x5), Quintessenza (x10)",
        effect: "(Dato Integrato) Incide complessi sigilli su un monolite posto sulle linee geomantiche, trasformandolo in un Luogo di Potere in grado di donare bonus e PR a chi attinge."
    },
    {
        file: "Illusione_Interattiva_4daa77141ce74625.json",
        name: "Illusione Interattiva",
        level: "master",
        difficultyCheck: "18",
        stamina: 15,
        duration: "Permanente",
        components: "Gessetto (x4), Cristallo (x2), Quintessenza (x4)",
        effect: "(Dato Integrato) Modella un'illusione su vasta scala in grado di ingannare tutti i sensi fisici (inclusi tatto, odore e gusto) senza infliggere alcun danno reale."
    },
    {
        file: "incantare_amuleto_e3bad33bb8d44ce7.json",
        name: "Incantare Amuleto",
        level: "master",
        difficultyCheck: "18",
        stamina: "Var.",
        duration: "Permanente",
        components: "Amuleto Semplice (x1), Arnesi Runici, Gemma Perfetta (1 a Incantesimo), Quintessenza (x2)",
        effect: "Incastona Incantesimi o Invocazioni dentro i gioielli di un amuleto. Il ritualista deve pagare integralmente la RES per ogni Incantesimo caricato durante il processo"
    }
];

function run() {
    console.log("💾 Starting systematic update of compendium rituals...");

    if (!fs.existsSync(RITUALS_DIR)) {
        console.error(`❌ Path not found: ${RITUALS_DIR}`);
        return;
    }

    let successCount = 0;

    RITUALS_DATA.forEach(entry => {
        const fullPath = path.join(RITUALS_DIR, entry.file);

        if (!fs.existsSync(fullPath)) {
            console.error(`❌ File not found: ${entry.file}`);
            return;
        }

        try {
            let fileContent = fs.readFileSync(fullPath, 'utf8');
            if (fileContent.charCodeAt(0) === 0xFEFF) {
                fileContent = fileContent.slice(1);
            }

            const data = JSON.parse(fileContent);

            // Keep root fields or set them cleanly
            data.name = entry.name;
            data.type = "ritual";

            if (!data.system) {
                data.system = {};
            }

            // Map level
            data.system.level = entry.level;

            // Map CD/difficultyCheck
            data.system.difficultyCheck = entry.difficultyCheck;

            // Map stamina and cost
            if (entry.stamina === "Var.") {
                data.system.stamina = 0;
                data.system.cost = 0;
                data.system.staminaIsVar = true;
            } else {
                const parsedStamina = parseInt(entry.stamina, 10);
                data.system.stamina = isNaN(parsedStamina) ? 0 : parsedStamina;
                data.system.cost = isNaN(parsedStamina) ? 0 : parsedStamina;
                data.system.staminaIsVar = false;
            }

            // Map duration
            data.system.duration = entry.duration;

            // Clean OCR junk in preparationTime
            data.system.preparationTime = "";

            // Map Components (neatly separated string)
            data.system.components = entry.components;

            // Map Effect (neatly separated string)
            data.system.effect = entry.effect;

            // Map Description (HTML representation of effect)
            data.system.description = `<p>${entry.effect}</p>`;

            // Write the updated JSON back, formatted nicely with 4 spaces
            fs.writeFileSync(fullPath, JSON.stringify(data, null, 4), 'utf8');
            console.log(`✅ Successfully updated: ${entry.file} (${entry.name})`);
            successCount++;

        } catch (e) {
            console.error(`❌ Failed to update ${entry.file}: ${e.message}`);
        }
    });

    console.log(`\n🎉 Process complete. Successfully updated ${successCount} out of ${RITUALS_DATA.length} ritual files.`);
}

run();
