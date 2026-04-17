"""
VERSION: 1.1.0
LAST_UPDATE: 2026-04-14
DESCRIPTION: Synchronizes image paths for curses and critical wounds compendiums.
"""

import os
import json

# Paths relative to repository root
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../"))

BASE_JSON_DIR = os.path.join(REPO_ROOT, "_tools/src-packs/GAMEPLAY/base")
PACKS = ["witcher-curses", "witcher-critical-wounds"]
PREFIX_BASE = "modules/witcher-compendium/assets/GAMEPLAY/base/"

def main():
    print("🔍 [SYNC] Starting Curses/Wounds image sync...")
    updated_files = 0

    if not os.path.exists(BASE_JSON_DIR):
        print(f"❌ Error: Base directory not found at {BASE_JSON_DIR}")
        return

    for pack in PACKS:
        pack_dir = os.path.join(BASE_JSON_DIR, pack)
        if not os.path.exists(pack_dir):
            print(f"⚠️ Warning: Pack directory not found: {pack}")
            continue
        
        for filename in os.listdir(pack_dir):
            if filename.endswith(".json"):
                fpath = os.path.join(pack_dir, filename)
                try:
                    with open(fpath, 'r', encoding='utf-8-sig') as f:
                        data = json.load(f)
                    
                    # Simple mapping: name.lower().webp
                    item_name = data.get("name", "").lower()
                    # Remove any special character that might break paths
                    item_name = item_name.replace(" ", "_").replace("'", "").replace("\"", "")
                    
                    new_img_path = f"{PREFIX_BASE}{pack}/{item_name}.webp"
                    
                    # Check if we should update
                    if data.get("img") != new_img_path:
                        data["img"] = new_img_path
                        with open(fpath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, indent=4, ensure_ascii=False)
                        updated_files += 1
                        print(f"✅ Updated {filename} in {pack}")
                except Exception as e:
                    print(f"❌ Error processing {filename}: {e}")

    print(f"✨ [DONE] Updated {updated_files} JSON files across curses and internal wounds.")

if __name__ == "__main__":
    main()
