#!/usr/bin/env python3
"""
Deploy Batch 74-77: converte le PNG generate in WebP 512px e le sposta nelle cartelle assets.
Usa le immagini dalla cartella brain AI output + temp_images.
"""

import os
import shutil
from pathlib import Path
from PIL import Image

# === CONFIG ===
REPO_ROOT = Path(__file__).parent.parent
BRAIN_DIR = Path(r"C:\Users\Manuel\.gemini\antigravity\brain\dd81a8ef-d6cb-4c7e-9b95-21bbe2a1eb41")
TEMP_DIR = REPO_ROOT / "temp_images"
ASSETS_ROOT = REPO_ROOT / "witcher-compendium" / "assets"

QUALITY = 80
MAX_SIZE = 512

def convert_and_deploy(src_path: Path, dest_dir: Path, dest_filename: str):
    """Converte un PNG in WebP 512px e lo salva nella cartella dest."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / dest_filename

    with Image.open(src_path) as img:
        # Resize mantenendo aspect ratio, max 512x512
        img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)
        # Converti in RGB se necessario (per WebP lossy)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(dest_path, "WEBP", quality=QUALITY)
    
    print(f"  OK: {src_path.name} -> {dest_path.relative_to(REPO_ROOT)}")
    return dest_path

# === MAPPATURA BATCH 74 ===
# Formato: (nome_file_sorgente_nel_brain, nome_destinazione_webp, cartella_assets_relativa)
BATCH_74 = [
    # Spell
    ("arieggiare_1778482755489.png", "arieggiare.webp", 
     "MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-spells"),
    ("aine_verseos_1778482770601.png", "aine_verseos.webp", 
     "MAGIA_E_MALEDIZIONI/Incantesimi_e_Rituali/witcher-spells"),
    # Formule alchemy
    ("formula_olio_anti_ancestrali_wo_1778482789574.png", "Formula_Olio_Anti-Ancestrali_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_olio_anti_bestie_wo_1778482810464.png", "Formula_Olio_Anti-Bestie_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_olio_anti_dragonidi_wo_1778482823682.png", "Formula_Olio_Anti-Dragonidi_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_olio_anti_elementali_wo_1778482839742.png", "Formula_Olio_Anti-Elementali_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_olio_anti_ibridi_wo_1778482861570.png", "Formula_Olio_Anti-Ibridi_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_olio_anti_insettoidi_wo_1778482874238.png", "Formula_Olio_Anti-Insettoidi_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_olio_anti_maledetti_wo_1778482885866.png", "Formula_Olio_Anti-Maledetti_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_olio_anti_necrofagi_wo_1778482906788.png", "Formula_Olio_Anti-Necrofagi_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_olio_anti_orchi_wo_1778482920652.png", "Formula_Olio_Anti-Orchi_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_olio_anti_spettri_wo_1778482934475.png", "Formula_Olio_Anti-Spettri_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_olio_anti_vampiri_wo_1778482954467.png", "Formula_Olio_Anti-Vampiri_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_veleno_dell_impiccato_wo_1778482968793.png", "Formula_Veleno_dell'Impiccato_wo_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_decotto_di_arachas_dec_1778482986819.png", "Formula_Decotto_di_Arachas_dec_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_decotto_di_demonio_dec_1778483006369.png", "Formula_Decotto_di_Demonio_dec_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("formula_decotto_di_grifone_dec_1778483020822.png", "Formula_Decotto_di_Grifone_dec_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
]

# === BATCH 75-77: da completare dopo reset quota AI ===
# Questi saranno caricati manualmente in temp_images dopo generazione
BATCH_75_TEMP = [
    # Nome file in temp_images -> dest webp -> cartella
    ("Formula_Decotto_di_Katakan_dec_.png", "Formula_Decotto_di_Katakan_dec_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Decotto_di_Lupo_Mannaro_dec_.png", "Formula_Decotto_di_Lupo_Mannaro_dec_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Decotto_di_Nekker_dec_.png", "Formula_Decotto_di_Nekker_dec_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Decotto_di_Strega_dei_Sepolcri_dec_.png", "Formula_Decotto_di_Strega_dei_Sepolcri_dec_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Decotto_di_Troll_dec_.png", "Formula_Decotto_di_Troll_dec_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Decotto_di_Viverna_dec_.png", "Formula_Decotto_di_Viverna_dec_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Decotto_di_Wraith_Diurno_dec_.png", "Formula_Decotto_di_Wraith_Diurno_dec_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Bufera_di_Neve_wp_.png", "Formula_Bufera_di_Neve_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Filtro_di_Petri_wp_.png", "Formula_Filtro_di_Petri_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Foresta_di_Maribor_wp_.png", "Formula_Foresta_di_Maribor_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Gatto_wp_.png", "Formula_Gatto_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Gufo_Fulvo_wp_.png", "Formula_Gufo_Fulvo_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Luna_Piena_wp_.png", "Formula_Luna_Piena_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Miele_Bianco_wp_.png", "Formula_Miele_Bianco_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Orca_Assassina_wp_.png", "Formula_Orca_Assassina_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
]

BATCH_76_TEMP = [
    ("Formula_Rigogolo_Dorato_wp_.png", "Formula_Rigogolo_Dorato_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Rondine_wp_.png", "Formula_Rondine_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Sangue_Nero_wp_.png", "Formula_Sangue_Nero_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Tuono_wp_.png", "Formula_Tuono_wp_.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Amico_dell'Avvelenatore.png", "Formula_Amico_dell'Avvelenatore.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Elisir_di_Pantagran_ex_5.png", "Formula_Elisir_di_Pantagran_ex_5.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Pozione_Profumo_ex_10.png", "Formula_Pozione_Profumo_ex_10.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Colla_Alchemica_ex_1.png", "Formula_Colla_Alchemica_ex_1.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Fisstech_ex_6.png", "Formula_Fisstech_ex_6.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Fuoco_Rapido_ex_2.png", "Formula_Fuoco_Rapido_ex_2.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Fuoco_Zerrikaniano_ex_7.png", "Formula_Fuoco_Zerrikaniano_ex_7.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Furia_di_Bredan_ex_8.png", "Formula_Furia_di_Bredan_ex_8.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Lacrime_di_Talgar_ex_9.png", "Formula_Lacrime_di_Talgar_ex_9.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Soluzione_Acida_ex_3.png", "Formula_Soluzione_Acida_ex_3.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
    ("Formula_Tomba_d'Adda.png", "Formula_Tomba_d'Adda.webp",
     "ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy"),
]

BATCH_77_TEMP = [
    ("Anti-Bestie.png", "Anti-Bestie.webp",
     "EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment"),
    ("Anti-Necrofagi.png", "Anti-Necrofagi.webp",
     "EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment"),
    ("layton_hermann.png", "layton_hermann.webp",
     "BESTIARIO/witcher-characters"),
    ("Pardus_di_Korath.png", "Pardus_di_Korath.webp",
     "BESTIARIO/witcher-characters"),
    ("rampino.png", "rampino.webp",
     "EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment"),
    ("simbolo_sacro.png", "simbolo_sacro.webp",
     "EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment"),
]


def run_deploy():
    """Deploy BATCH_74 (da brain AI) + qualsiasi file trovato in temp_images."""
    print("\n=== DEPLOY BATCH 74 (da AI brain output) ===")
    deployed = 0
    failed = 0
    for (src_name, dest_name, dest_rel) in BATCH_74:
        src = BRAIN_DIR / src_name
        dest_dir = ASSETS_ROOT / dest_rel
        if src.exists():
            convert_and_deploy(src, dest_dir, dest_name)
            deployed += 1
        else:
            print(f"  ⚠️  NON TROVATO: {src_name}")
            failed += 1

    print(f"\n  Batch 74: {deployed} deployati, {failed} mancanti")

    # Deploy da temp_images per batch 75-77
    for batch_label, batch_map in [("75", BATCH_75_TEMP), ("76", BATCH_76_TEMP), ("77", BATCH_77_TEMP)]:
        found_any = False
        for (src_name, dest_name, dest_rel) in batch_map:
            src = TEMP_DIR / src_name
            if src.exists():
                if not found_any:
                    print(f"\n=== DEPLOY BATCH {batch_label} (da temp_images) ===")
                    found_any = True
                dest_dir = ASSETS_ROOT / dest_rel
                convert_and_deploy(src, dest_dir, dest_name)
        if not found_any:
            print(f"\n  Batch {batch_label}: nessun file trovato in temp_images (quota AI esaurita, pendente).")

    print("\n=== DEPLOY COMPLETATO ===")


if __name__ == "__main__":
    run_deploy()
