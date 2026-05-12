import os
import glob
from PIL import Image

# Configurazione percorsi
# Usa il percorso assoluto della cartella del progetto
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_ROOT = os.path.join(REPO_ROOT, "temp_images")
ASSETS_BASE = os.path.join(REPO_ROOT, "witcher-compendium", "assets", "MAGIA_E_MALEDIZIONI")

# Mapping delle sottocartelle
SUB_MAPPING = {
    "witcher-invocations": r"Incantesimi_e_Rituali\witcher-invocations",
    "witcher-rituali": r"Incantesimi_e_Rituali\witcher-rituals",
    "witcher-rituals": r"Incantesimi_e_Rituali\witcher-rituals",
    "witcher-rituals-chaos": r"Incantesimi_e_Rituali\witcher-rituals-chaos",
    "witcher-runes": r"Incantesimi_e_Rituali\witcher-runes",
    "witcher-spells": r"Incantesimi_e_Rituali\witcher-spells",
    "witcher-spells-chaos": r"Incantesimi_e_Rituali\witcher-spells-chaos"
}

# Gestione speciale per file con nomi Gemini generici
SPECIAL_FILES = {
    "Gemini_Generated_Image_lzgf8ulzgf8ulzgf.png": "illusione_interattiva.webp"
}

print("Avvio processing asset manuali (Batch 49 e 50)...")

for src_sub, dest_sub in SUB_MAPPING.items():
    src_dir = os.path.join(SOURCE_ROOT, src_sub)
    if not os.path.exists(src_dir):
        continue
        
    print(f"\nCartella: {src_sub}")
    
    png_files = glob.glob(os.path.join(src_dir, "*.png"))
    for png_path in png_files:
        basename = os.path.basename(png_path)
        
        if basename in SPECIAL_FILES:
            new_name = SPECIAL_FILES[basename]
        else:
            new_name = os.path.splitext(basename)[0] + ".webp"
            
        target_dir = os.path.join(ASSETS_BASE, dest_sub)
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, new_name)
        
        print(f"  - {basename} -> {new_name}")
        
        try:
            with Image.open(png_path) as img:
                # Forza RGBA per gestire eventuali trasparenze se necessario, poi converte (anche se Gemini genera RGB solitamente)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize a 512x512
                img = img.resize((512, 512), Image.Resampling.LANCZOS)
                # Salvataggio in WebP quality 80
                img.save(target_path, "WEBP", quality=80)
        except Exception as e:
            print(f"  [ERRORE] Durante il processing di {basename}: {e}")

print("\nProcessing completato.")
