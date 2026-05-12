import os
import glob
from PIL import Image

# Configurazione percorsi
SOURCE_DIR = r"C:\Users\Manuel\.gemini\antigravity\brain\b9bff41f-57d5-49e9-b1b5-e0a703ec19a8"
REPO_ROOT = r"e:\AntigravitiProgetti\CompendioTheWitcher"
ASSETS_DIR = os.path.join(REPO_ROOT, "witcher-compendium", "assets", "MAGIA_E_MALEDIZIONI")

mapping = {
    "pozzo_di_conoscenza": r"Incantesimi_e_Rituali\witcher-invocations",
    "presagi_di_sventura": r"Incantesimi_e_Rituali\witcher-invocations",
    "presenza_del_divino": r"Incantesimi_e_Rituali\witcher-invocations",
    "ragnatela_di_radici": r"Incantesimi_e_Rituali\witcher-invocations",
    "sagitta_aurea": r"Incantesimi_e_Rituali\witcher-invocations",
    "sangue_del_berserker": r"Incantesimi_e_Rituali\witcher-invocations",
    "sangue_del_monte": r"Incantesimi_e_Rituali\witcher-invocations",
    "santuario_del_bosco_nero": r"Incantesimi_e_Rituali\witcher-invocations"
}

for item_name, rel_dir in mapping.items():
    png_files = glob.glob(os.path.join(SOURCE_DIR, f"{item_name}_*.png"))
    if not png_files:
        print(f"⚠️ Nessun file trovato per {item_name}")
        continue
        
    for png_path in png_files:
        basename = os.path.basename(png_path)
        new_name = item_name + ".webp"
        
        target_dir = os.path.join(ASSETS_DIR, rel_dir)
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, new_name)
        
        print(f"Processando {basename} -> {new_name}...")
        
        try:
            with Image.open(png_path) as img:
                # Resize a 512x512
                img = img.resize((512, 512), Image.Resampling.LANCZOS)
                # Salvataggio in WebP quality 80
                img.save(target_path, "WEBP", quality=80)
                print(f"[OK] Salvato webp ottimizzato in {target_path}")
        except Exception as e:
            print(f"[ERRORE] Durante il processing di {basename}: {e}")

print("\nDeploy Batch 49 (Parte 2 - Parziale) completato.")
