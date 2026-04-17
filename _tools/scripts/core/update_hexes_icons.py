# Witcher Compendium Maintenance Tool: Hex Icon Updater
# VERSION: 1.0.0
# LAST_UPDATE: 2026-04-14
# DESCRIPTION: Maps hex/curse names to specific icons and updates JSON metadata in src-packs.

import os
import json

# Setup base paths relative to script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../"))

# Configuration
PACK_DIRS = [
    os.path.join(REPO_ROOT, "_tools", "src-packs", "MAGIA", "base", "witcher-hexes-base"),
    os.path.join(REPO_ROOT, "_tools", "src-packs", "MAGIA", "caos", "witcher-hexes")
]
IMG_PREFIX = "modules/witcher-compendium/assets/MAGIA/hexes/"

# Mapping logic: Hex Name fragments -> Icon Filename
MAPPINGS = {
    "Pesta": "Fattura_Pesta.webp",
    "Prurito": "Fattura_Prurito.webp",
    "Bestia": "Fattura_Bestia.webp",
    "Ombre": "Fattura_Ombre.webp",
    "Fortuna": "Fattura_Sfortuna.webp",
    "Incubo": "Fattura_Incubo.webp",
    "Insaziabile": "Fattura_Fame.webp",
    "Dimenticanza": "Fattura_Incubo.webp",
    "Odiosa": "Fattura_Odio.webp",
    "Temperanza": "Fattura_Sfortuna.webp",
    "Malocchio": "Fattura_Sfortuna.webp",
    "Ossa di Vetro": "Fattura_Ossa_Vetro.webp"
}

def update_hexes():
    updated_count = 0
    for json_dir in PACK_DIRS:
        if not os.path.exists(json_dir):
            continue
            
        for filename in os.listdir(json_dir):
            if filename.endswith(".json"):
                fpath = os.path.join(json_dir, filename)
                try:
                    with open(fpath, 'r', encoding='utf-8-sig') as f:
                        data = json.load(f)
                    
                    name = data.get("name", "").lower()
                    best_match = None
                    
                    for key, asset_name in MAPPINGS.items():
                        if key.lower() in name:
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

    print(f"✅ Updated {updated_count} Hex JSON files across all magic packs.")

if __name__ == "__main__":
    update_hexes()
