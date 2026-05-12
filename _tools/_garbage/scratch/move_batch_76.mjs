import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const BRAIN_DIR = 'C:/Users/Manuel/.gemini/antigravity/brain/fc0cb6de-acf2-458a-99b6-170555c63882';
const TEMP_DIR = 'e:/AntigravitiProgetti/CompendioTheWitcher/temp_images';

// Mapping
const mapping = {
    "formula_rigogolo_dorato_wp_": "Formula_Rigogolo_Dorato_wp_.png",
    "formula_rondine_wp_": "Formula_Rondine_wp_.png",
    "formula_sangue_nero_wp_": "Formula_Sangue_Nero_wp_.png",
    "formula_tuono_wp_": "Formula_Tuono_wp_.png",
    "formula_amico_dell_avvelenatore": "Formula_Amico_dell'Avvelenatore.png",
    "formula_elisir_di_pantagran_ex_5": "Formula_Elisir_di_Pantagran_ex_5.png",
    "formula_pozione_profumo_ex_10": "Formula_Pozione_Profumo_ex_10.png",
    "formula_colla_alchemica_ex_1": "Formula_Colla_Alchemica_ex_1.png",
    "formula_fisstech_ex_6": "Formula_Fisstech_ex_6.png",
    "formula_fuoco_rapido_ex_2": "Formula_Fuoco_Rapido_ex_2.png",
    "formula_fuoco_zerrikaniano_ex_7": "Formula_Fuoco_Zerrikaniano_ex_7.png",
    "formula_furia_di_bredan_ex_8": "Formula_Furia_di_Bredan_ex_8.png",
    "formula_lacrime_di_talgar_ex_9": "Formula_Lacrime_di_Talgar_ex_9.png",
    "formula_soluzione_acida_ex_3": "Formula_Soluzione_Acida_ex_3.png",
    "formula_tomba_d_adda": "Formula_Tomba_d'Adda.png"
};

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const files = fs.readdirSync(BRAIN_DIR);

for (const [prefix, targetName] of Object.entries(mapping)) {
    const matchingFiles = files.filter(f => f.startsWith(prefix) && f.endsWith('.png'));
    if (matchingFiles.length > 0) {
        // Sort by stats to get latest
        matchingFiles.sort((a, b) => {
            return fs.statSync(path.join(BRAIN_DIR, b)).mtimeMs - fs.statSync(path.join(BRAIN_DIR, a)).mtimeMs;
        });
        const src = path.join(BRAIN_DIR, matchingFiles[0]);
        const dest = path.join(TEMP_DIR, targetName);
        fs.copyFileSync(src, dest);
        console.log(`Copied ${matchingFiles[0]} to ${targetName}`);
    } else {
        console.warn(`Warning: No file found with prefix ${prefix}`);
    }
}
