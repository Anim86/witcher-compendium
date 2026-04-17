# Witcher Compendium Maintenance Tool: Align Assets
# VERSION: 3.0.0
# LAST_UPDATE: 2026-04-14
# DESCRIPTION: Synchronizes src-packs JSON files with assets and a master image library.

import os
import json
import shutil

# Dynamic path resolution relative to _tools/scripts/core
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../"))
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")
IMAGES_MASTER = os.path.join(ROOT, "images")

def align_assets():
    """
    1. Maps all available images from the master images pool and existing assets.
    2. Iterates through all JSONs in src-packs.
    3. Updates 'img' paths in JSONs to match the assets hierarchy.
    4. Copies missing images from the master pool to the correct assets folder.
    """
    image_pool = {}
    
    # Scan root images folder (Master Pool)
    if os.path.exists(IMAGES_MASTER):
        for root, dirs, files in os.walk(IMAGES_MASTER):
            for f in files:
                if f.lower().endswith(('.webp', '.png', '.jpg', '.jpeg', '.svg')):
                    image_pool[f.lower()] = os.path.join(root, f)
    
    # Scan current assets folder as fallback
    if os.path.exists(ASSETS_DIR):
        for root, dirs, files in os.walk(ASSETS_DIR):
            for f in files:
                if f.lower().endswith(('.webp', '.png', '.jpg', '.jpeg', '.svg')):
                    # Only add if not already in pool (prefer master images)
                    if f.lower() not in image_pool:
                        image_pool[f.lower()] = os.path.join(root, f)

    modified_jsons = 0
    moved_files = 0

    print(f"🚀 Starting alignment. Source: {SRC_PACKS}")

    for root, dirs, files in os.walk(SRC_PACKS):
        for file in files:
            if not file.endswith(".json"):
                continue
                
            fpath = os.path.join(root, file)
            rel_dir = os.path.relpath(root, SRC_PACKS)
            
            try:
                # Use utf-8-sig to handle BOM
                with open(fpath, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                
                img_path = data.get("img", "")
                if not isinstance(img_path, str): continue
                
                filename = os.path.basename(img_path).lower()
                
                # If we have a real image filename (not placeholder) and it's in our pool
                if filename and "placeholder" not in filename and filename in image_pool:
                    source_image = image_pool[filename]
                    
                    # Normalize target paths
                    target_rel_dir = rel_dir.replace(os.sep, "/")
                    target_img_path = f"modules/witcher-compendium/assets/{target_rel_dir}/{os.path.basename(source_image)}"
                    target_abs_path = os.path.join(ASSETS_DIR, target_rel_dir.replace("/", os.sep), os.path.basename(source_image))
                    
                    # Update JSON if path changed
                    if data["img"] != target_img_path:
                        data["img"] = target_img_path
                        with open(fpath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, indent=4, ensure_ascii=False)
                        modified_jsons += 1
                        
                    # Copy image to target location if missing
                    os.makedirs(os.path.dirname(target_abs_path), exist_ok=True)
                    if not os.path.exists(target_abs_path):
                        shutil.copy2(source_image, target_abs_path)
                        moved_files += 1
                
            except Exception as e:
                print(f"Error processing {file}: {e}")

    print(f"\n✅ Alignment Completed:")
    print(f"   - JSON files updated: {modified_jsons}")
    print(f"   - Asset files aligned: {moved_files}")

if __name__ == "__main__":
    align_assets()
