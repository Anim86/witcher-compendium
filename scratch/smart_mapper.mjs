import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const ANALYSIS_FILE = path.join(REPO_ROOT, 'scratch', 'missing_analysis.json');

const data = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf8'));
const missingItems = data.completelyMissing;

// Mappatura concettuale: se il nome dell'elemento contiene una di queste chiavi, usa il file corrispondente.
const mappings = [
    // --- SKILLS ---
    { keywords: ['carisma', 'seduzione', 'inganno', 'persuasione', 'intimidire', 'esibirsi', 'etichetta', 'sociale', 'linguaggio', 'lingua', 'commercio'],
      source: 'REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills/sociale.webp' },
      
    { keywords: ['atletica', 'rissa', 'eludere', 'cavalcare', 'forma bestiale', 'sangue e ossa', 'tempra', 'sopravvivenza'],
      source: 'REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills/fisiche.webp' },
      
    { keywords: ['armi in asta', 'lame corte', 'scherma', 'coraggio', 'tattica', 'combattimento'],
      source: 'REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills/combattimento.webp' },
      
    { keywords: ['deduzione', 'leggere la natura', 'navigazione', 'bestiario', 'storia', 'sapere', 'custode', 'accortezza', 'insegnamento', 'istruzione', 'sensibilità', 'pronto soccorso', 'guaritore', 'bosco', 'animale'],
      source: 'REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills/sapere.webp' },
      
    { keywords: ['arti', 'artistiche'],
      source: 'REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills/artistiche.webp' },
      
    { keywords: ['intessere', 'resistere alla magia', 'prestidigitazione', 'iniziato', 'benedizioni', 'magiche', 'rituali', 'magia', 'mistagogo', 'culto', 'parola di dio', 'preveggenza', 'divino', 'divina'],
      source: 'REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills/magiche.webp' },
      
    { keywords: ['trappole', 'scassinare', 'artigianato', 'manifattura', 'contraffazione', 'falsificare', 'tecniche', 'camuffare', 'coercizione', 'scaltrezza'],
      source: 'REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills/tecniche.webp' },

    // --- FERITE CRITICHE ---
    { keywords: ['costole', 'stomaco', 'cardiaci', 'milza', 'pneumotorace', 'shock', 'interna'],
      source: 'REGOLAMENTO_E_NARRATIVA/Ferite_Critiche/witcher-critical-wounds/interna.webp' },
    { keywords: ['mascella', 'occhio', 'sfregio', 'testa'],
      source: 'REGOLAMENTO_E_NARRATIVA/Ferite_Critiche/witcher-critical-wounds/testa.webp' },
    { keywords: ['frattur', 'frattura'],
      source: 'REGOLAMENTO_E_NARRATIVA/Ferite_Critiche/witcher-critical-wounds/frattura.webp' },

    // --- EQUIPAGGIAMENTO ---
    { keywords: ['locanda', 'tenda', 'alloggio', 'stallaggio'],
      source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/alloggio_e_riposo.webp' },
    { keywords: ['candele'],
      source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/candele_a5.webp' },
    { keywords: ['kit', 'strumenti', 'utensili', 'picchetti', 'manette', 'specchietto', 'lavanderia', 'sapone', 'profumo', 'tabacco', 'pipa'],
      source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/strumenti.webp' },
    { keywords: ['camuffamento', 'trucco', 'disonesti', 'segreto', 'segreta', 'rampino'],
      source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/oggetti_disonesti.webp' },
    { keywords: ['pasto', 'razioni', 'vino', 'viveri', 'bevande', 'superalcolici'],
      source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/viveri_e_bevande.webp' },
    { keywords: ['scrigno', 'sacco', 'sacca', 'contenitori'],
      source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/contenitori.webp' },
    { keywords: ['mappa', 'libri', 'documenti', 'messaggero', 'pedaggio', 'traversata'],
      source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/libri_e_documenti.webp' },
    { keywords: ['gwent', 'puntelli', 'corno', 'fischietto', 'cote', 'telecomunicatore', 'ogh', 'paglia', 'prostituta'],
      source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/abbigliamento.webp' }, // Fallback generico
      
    // --- MAGIE & ALTRO (Fallback) ---
    // Useremo un fallback basato sulla cartella.
];

const fallbackMappings = {
    'witcher-spells': 'MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-spells/ondate_della_naglfar.webp',
    'witcher-trophies': 'REGOLAMENTO_E_NARRATIVA/Trofei/witcher-trophies/Trofeo_Elementale.webp', // Usiamo l'elementale o un lupo generico se trovato,
    'witcher-schematics': 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics/schema_maglio_del_contadino.webp',
    'witcher-magic-items': 'EQUIPAGGIAMENTO_E_TRASPORTI/Reliquie_e_Artefatti/witcher-magic-items/pietra_guardiana_arco.webp',
    'witcher-special-chaos': 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos/pietra_arco_pietra_del_potere.webp',
    'iorveth.webp': 'BESTIARIO/witcher-characters/aenarinn_.webp', // Placeholder
};


let copiedCount = 0;
let fallbackCount = 0;
let errorCount = 0;

for (const item of missingItems) {
    const nameLower = item.name.toLowerCase();
    let sourceRelPath = null;

    // 1. Cerca nella mappatura concettuale
    for (const mapping of mappings) {
        if (mapping.keywords.some(kw => nameLower.includes(kw))) {
            sourceRelPath = mapping.source;
            break;
        }
    }

    // 2. Fallback per cartella
    if (!sourceRelPath) {
        for (const [folder, fallback] of Object.entries(fallbackMappings)) {
            if (item.expected.includes(folder)) {
                sourceRelPath = fallback;
                break;
            }
        }
    }
    
    // Default fallback
    if (!sourceRelPath) {
        sourceRelPath = 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/oggetti_disonesti.webp';
    }

    const sourcePath = path.join(ASSETS_ROOT, sourceRelPath);
    const targetPath = path.join(ASSETS_ROOT, item.expected);

    try {
        if (!fs.existsSync(sourcePath)) {
            // Cerchiamo di usare un altro fallback se il file non esiste
            console.log(`Fallback non trovato per ${sourceRelPath}, uso oggetto generico`);
        } else {
            const targetDir = path.dirname(targetPath);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            fs.copyFileSync(sourcePath, targetPath);
            copiedCount++;
        }
    } catch (err) {
        console.error(`Errore su ${item.name}: ${err.message}`);
        errorCount++;
    }
}

console.log(`\n🎉 Automazione Opzione 1 Completata!`);
console.log(`File mappati e copiati: ${copiedCount}`);
console.log(`Errori: ${errorCount}`);
