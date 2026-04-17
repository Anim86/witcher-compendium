# Witcher Compendium Maintenance Tool: Special Item Icon Updater
# VERSION: 1.0.0
# LAST_UPDATE: 2026-04-14
# DESCRIPTION: Maps special items like potions, decotions, and witcher gear to specific icons and updates JSON metadata in src-packs.

import os
import json

# Setup base paths relative to script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../"))

# Configuration
PACK_PATHS = [
    os.path.join(REPO_ROOT, "_tools", "src-packs", "EQUIPAGGIAMENTO", "base", "witcher-special"),
    os.path.join(REPO_ROOT, "_tools", "src-packs", "EQUIPAGGIAMENTO", "caos", "witcher-special-chaos")
]
IMG_PREFIX = "modules/witcher-compendium/assets/EQUIPAGGIAMENTO/base/witcher-special/"

# Mapping logic: Item Name fragments -> Icon Filename
MAPPINGS = {
    "Anti-": "Witcher_Unguento.webp",
    "Decotto": "Witcher_Decotto.webp",
    "Pozione": "Witcher_Pozione.webp",
    "Bufera": "Witcher_Pozione.webp",
    "Rondine": "Witcher_Pozione.webp",
    "Gatto": "Witcher_Pozione.webp",
    "Tuono": "Witcher_Pozione.webp",
    "Fulmine": "Witcher_Pozione.webp",
    "Spada d'argento": "Spada_Argento_Witcher.webp",
    "Spada d'acciaio": "Spada_Acciaio_Witcher.webp",
    "Medaglione": "Medaglione_Witcher.webp",
    "Runa": "Runa_Witcher.webp"
}

def update_special_icons():
    updated_count = 0
    for d in PACK_PATHS:
        if os.path.exists(d):
            for filename in os.listdir(d):
                if filename.endswith(".json"):
                    fpath = os.path.join(d, filename)
                    try:
                        with open(fpath, 'r', encoding='utf-8-sig') as f:
                            data = json.load(f)
                        
                        name = data.get("name", "")
                        best_match = None
                        
                        for key, asset_name in MAPPINGS.items():
                            if key.lower() in name.lower():
                                best_match = asset_name
                                break
                        
                        if best_match:
                            new_img = f"{IMG_PREFIX}{best_match}"
                            if data.get("img") != new_img:
                                data["img"] = new_img
                                with open(fpath, 'w', encoding='utf-8') as f:
                                    json.dump(data, f, indent=4, ensure_ascii=False)
                                updated_count += 1
                    except Exception as e:
                        print(f"❌ Error processing {filename}: {e}")

    print(f"✅ Updated {updated_count} Special/Chaos items.")

if __name__ == "__main__":
    update_special_icons()
