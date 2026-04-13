import os
import json
import shutil

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")

def mirror():
    modified_jsons = 0
    moved_files = 0
    
    # 1. First, let's collect all current assets so we can move them to their new homes
    asset_pool = {} # filename -> current_abs_path
    for root, dirs, files in os.walk(ASSETS_DIR):
        for f in files:
            if f.lower().endswith(('.webp', '.png', '.jpg', '.jpeg', '.svg')):
                asset_pool[f.lower()] = os.path.join(root, f)

    # 2. Iterate through src-packs
    for root, dirs, files in os.walk(SRC_PACKS):
        for file in files:
            if not file.endswith(".json"):
                continue
            
            fpath = os.path.join(root, file)
            rel_dir = os.path.relpath(root, SRC_PACKS)
            
            try:
                with open(fpath, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                
                img_path = data.get("img", "")
                if not isinstance(img_path, str): continue
                
                filename = os.path.basename(img_path)
                target_rel_dir = rel_dir.replace(os.sep, "/")
                
                # New intended path in assets mirroring src-packs
                new_img_path = f"modules/witcher-compendium/assets/{target_rel_dir}/{filename}"
                new_abs_asset_dir = os.path.join(ASSETS_DIR, target_rel_dir.replace("/", os.sep))
                new_abs_asset_path = os.path.join(new_abs_asset_dir, filename)
                
                # Update JSON if needed
                if img_path != new_img_path:
                    data["img"] = new_img_path
                    with open(fpath, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=4, ensure_ascii=False)
                    modified_jsons += 1
                
                # Move/Copy the actual file if we have it in the pool
                if filename.lower() in asset_pool and not "placeholder" in filename.lower():
                    source_path = asset_pool[filename.lower()]
                    if source_path != new_abs_asset_path:
                        os.makedirs(new_abs_asset_dir, exist_ok=True)
                        shutil.copy2(source_path, new_abs_asset_path)
                        moved_files += 1
                        
            except Exception as e:
                pass

    print(f"Structure Mirroring Complete:")
    print(f"JSONs updated: {modified_jsons}")
    print(f"Assets relocated: {moved_files}")

if __name__ == "__main__":
    mirror()
