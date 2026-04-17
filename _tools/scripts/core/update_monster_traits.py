# Witcher Compendium Maintenance Tool: Monster Trait Icon Updater
# VERSION: 1.0.0
# LAST_UPDATE: 2026-04-14
# DESCRIPTION: Updates icons for embedded items (traits/abilities) within Actor JSON files in Bestiario packs.

import os
import json

# Setup base paths relative to script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../"))

# Configuration
ACTOR_DIRS = [
    os.path.join(REPO_ROOT, "_tools", "src-packs", "BESTIARIO", "MOSTRI"),
    os.path.join(REPO_ROOT, "_tools", "src-packs", "BESTIARIO", "PNG")
]
IMG_PREFIX = "modules/witcher-compendium/assets/BESTIARIO/traits/"

# Mapping rules: Item Name fragments -> Icon Filename
MAPPINGS = {
    "Morso": "Trait_Zanne.webp",
    "Zanne": "Trait_Zanne.webp",
    "Denti": "Trait_Zanne.webp",
    "Chele": "Trait_Artigli.webp",
    "Artigli": "Trait_Artigli.webp",
    "Peculiare": "Trait_Artigli.webp",
    "Zoccoli": "Trait_Artigli.webp",
    "Corna": "Trait_Artigli.webp",
    "Coda": "Trait_Artigli.webp",
    "Ragnatela": "Trait_Ragnatela.webp",
    "Filamento": "Trait_Ragnatela.webp",
    "Sguardo": "Trait_Occhio.webp",
    "Occhio": "Trait_Occhio.webp",
    "Ipnosi": "Trait_Occhio.webp",
    "Vedere": "Trait_Occhio.webp",
    "Camuffamento": "Trait_Camuffamento.webp",
    "Mimetismo": "Trait_Camuffamento.webp",
    "Invisibilità": "Trait_Camuffamento.webp",
    "Nascondersi": "Trait_Camuffamento.webp",
    "Volo": "Trait_Volo.webp",
    "Ali": "Trait_Volo.webp",
    "Volare": "Trait_Volo.webp"
}

def update_monster_traits():
    updated_actors = 0
    updated_items = 0

    for actor_dir in ACTOR_DIRS:
        if not os.path.exists(actor_dir):
            continue
            
        for filename in os.listdir(actor_dir):
            if filename.endswith(".json"):
                fpath = os.path.join(actor_dir, filename)
                try:
                    with open(fpath, 'r', encoding='utf-8-sig') as f:
                        data = json.load(f)
                    
                    changed = False
                    if "items" in data:
                        for item in data["items"]:
                            item_name = item.get("name", "").lower()
                            best_match = None
                            
                            for key, asset_name in MAPPINGS.items():
                                if key.lower() in item_name:
                                    best_match = asset_name
                                    break
                            
                            if best_match:
                                new_img = f"{IMG_PREFIX}{best_match}"
                                if item.get("img") != new_img:
                                    item["img"] = new_img
                                    updated_items += 1
                                    changed = True
                            elif item.get("type") in ["note", "ability", "trait"]:
                                if "icons/svg" in item.get("img", ""):
                                    item["img"] = f"{IMG_PREFIX}Trait_Generico.webp"
                                    updated_items += 1
                                    changed = True
                    
                    if changed:
                        with open(fpath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, indent=4, ensure_ascii=False)
                        updated_actors += 1
                except Exception as e:
                    print(f"❌ Error processing {filename}: {e}")

    print(f"✅ Updated {updated_items} items inside {updated_actors} Actors.")

if __name__ == "__main__":
    update_monster_traits()
