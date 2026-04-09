const fs = require('fs');
const path = require('path');

// Configurazione percorsi
const BASE_DIR = 'e:/AntigravitiProgetti/CompendioTheWitcher';
const WEAPONS_TXT = path.join(BASE_DIR, 'Tomo Base/Testi/Pag074_Armi.txt');
const ARMOR_TXT = path.join(BASE_DIR, 'Tomo Base/Testi/Pag080_Armature.txt');
const WEAPONS_DIR = path.join(BASE_DIR, '_tools/src-packs/witcher-weapons');
const ARMOR_DIR = path.join(BASE_DIR, '_tools/src-packs/witcher-armor');

/**
 * Normalizza il nome per il matching (converte apostrofo tipografico in standard, trimma)
 */
function normalizeName(name) {
    if (!name) return "";
    // Normalizziamo apostrofi e variazioni comuni da/d'
    let norm = name.replace(/’/g, "'").trim().toLowerCase();
    // Special case per Cappuccio da/d'Arciere
    norm = norm.replace(/\bda arciere\b/, "d'arciere");
    return norm;
}

/**
 * Estrae le descrizioni da un testo sorgente basandosi su una lista di nomi attesi
 */
function extractDescriptions(text, names, sectionStartMarker) {
    const startIndex = text.indexOf(sectionStartMarker);
    if (startIndex === -1) return new Map();

    const sectionText = text.substring(startIndex);
    const descriptions = new Map();

    // Ordiniamo i nomi per lunghezza decrescente per evitare match parziali (es. "Spada" vs "Spada d'Arme")
    const sortedNames = [...names].sort((a, b) => b.length - a.length);

    for (let i = 0; i < sortedNames.length; i++) {
        const name = sortedNames[i];
        const normalizedName = normalizeName(name);
        
        // Creazione regex flessibile:
        // 1. Gestisce d' / da / de / di intercambiabili se seguiti da vocale
        // 2. Gestisce apostrofi tipografici
        let flexibleName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        flexibleName = flexibleName.replace(/'/g, "[’']");
        flexibleName = flexibleName.replace(/\bda\s+/gi, "(?:da\\s+|d[’'])");
        flexibleName = flexibleName.replace(/\bde\s+/gi, "(?:de\\s+|d[’'])");
        flexibleName = flexibleName.replace(/\bdi\s+/gi, "(?:di\\s+|d[’'])");

        const regex = new RegExp(`^${flexibleName}\\s+(.*)`, 'mi');
        const match = sectionText.match(regex);

        if (match) {
            // Trovato l'inizio della descrizione. Dobbiamo capire dove finisce.
            // La descrizione finisce quando incontriamo un altro nome della lista o un marker di pagina.
            let fullDesc = match[1];
            
            // Limitiamo la ricerca al testo successivo al match
            const restOfText = sectionText.substring(match.index + match[0].length);
            
            // Troviamo il prossimo item
            let nextIndex = restOfText.length;
            for (const otherName of sortedNames) {
                if (otherName === name) continue;
                const otherEscaped = otherName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "[’']");
                const otherRegex = new RegExp(`^${otherEscaped}\\s+`, 'mi');
                const nextMatch = restOfText.match(otherRegex);
                if (nextMatch && nextMatch.index < nextIndex) {
                    nextIndex = nextMatch.index;
                }
            }
            
            // Controlliamo anche i marker di sezione o pagina che potrebbero interrompere
            const pageMarkerIdx = restOfText.indexOf('--- Pagina');
            if (pageMarkerIdx !== -1 && pageMarkerIdx < nextIndex) {
                nextIndex = pageMarkerIdx;
            }

            fullDesc = (fullDesc + ' ' + restOfText.substring(0, nextIndex)).trim();
            
            // Pulizia finale (rimozione di "Alessandro Pacifico", "Pagina XX", ecc.)
            fullDesc = fullDesc.replace(/Alessandro Pacifico - \d+/g, '');
            fullDesc = fullDesc.replace(/--- Pagina \d+ ---/g, '');
            fullDesc = fullDesc.replace(/\[Immagini presenti.*?\]/g, '');
            fullDesc = fullDesc.replace(/\d+\s+ Nome Tipo PA Disp\..*? Peso Costo/g, ''); // Intestazioni tabelle
            fullDesc = fullDesc.replace(/\s+/g, ' ').trim();

            descriptions.set(normalizedName, fullDesc);
        }
    }
    return descriptions;
}

async function runFix() {
    console.log("Inizio processo di correzione descrizioni...");
    
    // 1. Caricamento nomi dai pack esistenti
    const weaponsFiles = fs.readdirSync(WEAPONS_DIR).filter(f => f.endsWith('.json'));
    const armorFiles = fs.readdirSync(ARMOR_DIR).filter(f => f.endsWith('.json'));

    const weaponNames = weaponsFiles.map(f => JSON.parse(fs.readFileSync(path.join(WEAPONS_DIR, f))).name);
    const armorNames = armorFiles.map(f => JSON.parse(fs.readFileSync(path.join(ARMOR_DIR, f))).name);

    // 2. Lettura e parsing dei TXT
    const weaponsText = fs.readFileSync(WEAPONS_TXT, 'utf8');
    const armorText = fs.readFileSync(ARMOR_TXT, 'utf8');

    const weaponMap = extractDescriptions(weaponsText, weaponNames, "DESCRIZIONE DELLE ARMI");
    const armorMap = extractDescriptions(armorText, armorNames, "DESCRIZIONE DELLE ARMATURE");

    // 3. Esecuzione correzione ARMI
    console.log("\n--- AGGIORNAMENTO ARMI ---");
    for (const file of weaponsFiles) {
        const filePath = path.join(WEAPONS_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath));
        const normName = normalizeName(data.name);
        const newDesc = weaponMap.get(normName);

        if (newDesc) {
            data.system.description = `<p>${newDesc}</p>`;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
            console.log(`${data.name} -> iniettata ✅`);
        } else {
            console.warn(`${data.name} -> descrizione NON trovata ⚠️`);
        }
    }

    // 4. Esecuzione correzione ARMATURE
    console.log("\n--- AGGIORNAMENTO ARMATURE ---");
    for (const file of armorFiles) {
        const filePath = path.join(ARMOR_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath));
        const normName = normalizeName(data.name);
        const newDesc = armorMap.get(normName);

        if (newDesc) {
            data.system.description = `<p>${newDesc}</p>`;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
            console.log(`${data.name} -> iniettata ✅`);
        } else {
            console.warn(`${data.name} -> descrizione NON trovata ⚠️`);
        }
    }

    console.log("\nProcesso completato!");
}

runFix().catch(err => console.error(err));
