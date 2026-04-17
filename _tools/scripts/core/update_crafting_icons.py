# Witcher Compendium Maintenance Tool: Crafting Icon Updater
# VERSION: 1.0.0
# LAST_UPDATE: 2026-04-14
# DESCRIPTION: Maps crafting materials, formulas, and mutagens to specific icons and updates JSON metadata in src-packs.

import os
import json

# Setup base paths relative to script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../"))

# Configuration
CRAFTING_DIRS = [
    os.path.join(REPO_ROOT, "_tools", "src-packs", "CRAFTING", "witcher-components"),
    os.path.join(REPO_ROOT, "_tools", "src-packs", "CRAFTING", "base", "witcher-components-mutageni-dw"),
    os.path.join(REPO_ROOT, "_tools", "src-packs", "CRAFTING", "witcher-alchemy"),
    os.path.join(REPO_ROOT, "_tools", "src-packs", "CRAFTING", "witcher-schematics")
]
IMG_PREFIX = "modules/witcher-compendium/assets/CRAFTING/"

def update_crafting():
    updated_files = 0

    for c_dir in CRAFTING_DIRS:
        if not os.path.exists(c_dir):
            continue
            
        for root, dirs, files in os.walk(c_dir):
            for filename in files:
                if filename.endswith(".json"):
                    fpath = os.path.join(root, filename)
                    try:
                        with open(fpath, 'r', encoding='utf-8-sig') as f:
                            data = json.load(f)
                        
                        name = data.get("name", "").lower()
                        sys_type = data.get("system", {}).get("type", "")
                        
                        new_img = None
                        
                        if "mutageno" in name or "mutageni" in root.lower():
                            new_img = f"{IMG_PREFIX}Crafting_Mutageno.webp"
                        elif sys_type == "alchemical" or "alchem" in root.lower() or "formula" in name:
                            new_img = f"{IMG_PREFIX}Crafting_Alchimia.webp"
                        elif sys_type == "crafting-material" or "component" in root.lower() or "acciaio" in name or "ferro" in name:
                            new_img = f"{IMG_PREFIX}Crafting_Materiali.webp"
                        else:
                            new_img = f"{IMG_PREFIX}Crafting_Generico.webp"
                        
                        if data.get("img") != new_img:
                            data["img"] = new_img
                            with open(fpath, 'w', encoding='utf-8') as f:
                                json.dump(data, f, indent=4, ensure_ascii=False)
                            updated_files += 1
                    except Exception as e:
                        print(f"❌ Error processing {filename}: {e}")

    print(f"✅ Updated {updated_files} Crafting/Alchemy JSON files.")

if __name__ == "__main__":
    update_crafting()
