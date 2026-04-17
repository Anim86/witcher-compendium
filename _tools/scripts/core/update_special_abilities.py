# Witcher Compendium Maintenance Tool: Update Special Abilities (Normalized)
# VERSION: 3.1.1
# LAST_UPDATE: 2026-04-14
# DESCRIPTION: Maps special item types to custom WebP icons (Standalone JSON Patcher).

import os
import json

# Dynamic REPO_ROOT resolution
# Script location: _tools/scripts/core/update_special_abilities.py
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../"))

# Target directory in witcher-compendium/assets/
# Note: Assets must exist in this folder. Use external generation tools if missing.
ASSETS_DIR = os.path.join(REPO_ROOT, "witcher-compendium", "assets", "SPECIAL")

# Target directories in src-packs
SOURCE_PACKS = [
    os.path.join(REPO_ROOT, "_tools", "src-packs", "GAMEPLAY", "base", "witcher-investigations"),
    os.path.join(REPO_ROOT, "_tools", "src-packs", "MAGIA", "caos", "witcher-necromanzia"),
    os.path.join(REPO_ROOT, "_tools", "src-packs", "MAGIA", "caos", "witcher-gifts"),
    os.path.join(REPO_ROOT, "_tools", "src-packs", "GAMEPLAY", "base", "witcher-trophies")
]

# Mapping rules: substring in name -> filename in assets/SPECIAL/
MAPPINGS = {
    "Trofeo": "Trait_Generico.webp",
    "Indizio": "Investigazione_Indizio.webp",
    "Analisi": "Investigazione_Indizio.webp",
    "Analizzare": "Investigazione_Indizio.webp",
    "Decifrare": "Investigazione_Documento.webp",
    "Cadavere": "Investigazione_Cadavere.webp",
    "Ostacolo": "Investigazione_Ostacolo.webp",
    "Falsa Pista": "Investigazione_Ostacolo.webp",
    "Cadavere": "Necromanzia_Teschio.webp",
    "Teschio": "Necromanzia_Teschio.webp",
    "Anime": "Gift_Mente.webp",
    "Spiriti": "Gift_Mente.webp",
    "Rianimare": "Gift_Fuoco.webp",
    "Hanmarvyn": "Gift_Mente.webp",
    "Pirocinesi": "Gift_Fuoco.webp",
    "Aerocinesi": "Gift_Aria.webp",
    "Criocinesi": "Gift_Ghiaccio.webp",
    "Geocinesi": "Gift_Terra.webp",
    "Volo": "Trait_Volo.webp"
}

IMG_PREFIX = "modules/witcher-compendium/assets/SPECIAL/"

def update_abilities():
    print(f"MAINTENANCE: Normalizing Special Abilities...")
    print(f"REPO_ROOT: {REPO_ROOT}")
    
    updated_count = 0
    scanned_count = 0

    for pack_dir in SOURCE_PACKS:
        if not os.path.exists(pack_dir):
            print(f"WARNING: Directory not found: {pack_dir}")
            continue
            
        print(f"SCANNING: {os.path.relpath(pack_dir, REPO_ROOT)}")
        
        for filename in os.listdir(pack_dir):
            if filename.endswith(".json"):
                scanned_count += 1
                fpath = os.path.join(pack_dir, filename)
                
                try:
                    with open(fpath, 'r', encoding='utf-8-sig') as f:
                        data = json.load(f)
                    
                    item_name = data.get("name", "").lower()
                    current_img = data.get("img", "")
                    best_match = None
                    
                    # Search for mapping match
                    for key, asset_name in MAPPINGS.items():
                        if key.lower() in item_name:
                            best_match = asset_name
                            break
                    
                    new_img = None
                    if best_match:
                        new_img = f"{IMG_PREFIX}{best_match}"
                    elif "icons/svg" in current_img or not current_img:
                        new_img = f"{IMG_PREFIX}Trait_Generico.webp"

                    if new_img and current_img != new_img:
                        data["img"] = new_img
                        with open(fpath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, indent=4, ensure_ascii=False)
                        updated_count += 1
                        
                except Exception as e:
                    print(f"ERROR in {filename}: {e}")

    print(f"\nOperation complete.")
    print(f"--- File scansionati: {scanned_count}")
    print(f"--- File aggiornati: {updated_count}")
    print(f"\nNota: La conversione dai PNG (cartella brain) è stata rimossa.")
    print(f"Assicurarsi che i file siano presenti in {os.path.relpath(ASSETS_DIR, REPO_ROOT)}")

if __name__ == "__main__":
    update_abilities()
