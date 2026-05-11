import os
import shutil
from pathlib import Path

# Paths
BRAIN_DIR = Path(r"C:\Users\Manuel\.gemini\antigravity\brain\fc0cb6de-acf2-458a-99b6-170555c63882")
TEMP_DIR = Path(r"e:\AntigravitiProgetti\CompendioTheWitcher\temp_images")

# Mapping
mapping = {
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
}

TEMP_DIR.mkdir(parents=True, exist_ok=True)

for prefix, target_name in mapping.items():
    # Find the file in brain dir
    found = list(BRAIN_DIR.glob(f"{prefix}*.png"))
    if found:
        # Get the latest one if multiple exist
        found.sort(key=os.path.getmtime, reverse=True)
        src = found[0]
        dest = TEMP_DIR / target_name
        shutil.copy2(src, dest)
        print(f"Copied {src.name} to {target_name}")
    else:
        print(f"Warning: No file found with prefix {prefix}")
