import os
import json
from PIL import Image

# Configurazione percorsi
ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
ASSETS_BASE = os.path.join(ROOT, "witcher-compendium", "assets")
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")

def process_asset(artifact_path, target_rel_path, json_filename=None):
    """
    artifact_path: Percorso assoluto del PNG generato
    target_rel_path: Percorso relativo dentro assets/ (es. 'BESTIARIO/PNG/geralt_di_rivia.webp')
    json_filename: Nome esatto del file JSON da aggiornare (opzionale)
    """
    
    # 1. Conversione e Ridimensionamento
    dest_path = os.path.join(ASSETS_BASE, target_rel_path)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    print(f"Elaborazione: {os.path.basename(artifact_path)} -> {target_rel_path}")
    
    with Image.open(artifact_path) as img:
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        img.save(dest_path, "WEBP", quality=90)
    
    print(f"Salvato in: {dest_path}")
    
    # 2. Aggiornamento JSON
    if json_filename:
        update_json_reference(json_filename, target_rel_path)

def update_json_reference(json_filename, target_rel_path):
    # Ricerca ricorsiva del file JSON in src-packs
    found = False
    for root, dirs, files in os.walk(SRC_PACKS):
        if json_filename in files:
            fpath = os.path.join(root, json_filename)
            with open(fpath, 'r', encoding='utf-8-sig') as f:
                data = json.load(f)
            
            new_img_path = f"modules/witcher-compendium/assets/{target_rel_path.replace(os.sep, '/')}"
            data["img"] = new_img_path
            
            with open(fpath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            
            print(f"Aggiornato riferimento in: {json_filename}")
            found = True
            break
    
    if not found:
        print(f"ATTENZIONE: File {json_filename} non trovato in {SRC_PACKS}")

if __name__ == "__main__":
    # Esempio di utilizzo manuale per il Batch 1 (Modificare i percorsi artifact secondo necessità)
    # process_asset(r"ARTIFACT_PATH", r"BESTIARIO/PNG/geralt_di_rivia.webp", "Geralt_di_Rivia_6e70635f67657261.json")
    pass
