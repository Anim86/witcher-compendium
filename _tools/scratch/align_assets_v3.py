import os
import json
import shutil

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")
IMAGES_MASTER = os.path.join(ROOT, "images")

def align_v3():
    # 1. Map all available images (from images folder and current assets folder)
    image_pool = {}
    
    # Scan root images folder
    if os.path.exists(IMAGES_MASTER):
        for root, dirs, files in os.walk(IMAGES_MASTER):
            for f in files:
                if f.lower().endswith(('.webp', '.png', '.jpg', '.jpeg', '.svg')):
                    image_pool[f.lower()] = os.path.join(root, f)
    
    # Scan current assets folder
    for root, dirs, files in os.walk(ASSETS_DIR):
        for f in files:
            if f.lower().endswith(('.webp', '.png', '.jpg', '.jpeg', '.svg')):
                # Only add if not already in pool (prefer master images)
                if f.lower() not in image_pool:
                    image_pool[f.lower()] = os.path.join(root, f)

    modified_jsons = 0
    moved_files = 0

    # 2. Iterate through all JSONs in src-packs
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
                
                # Check if it's a placeholder or already correct
                filename = os.path.basename(img_path).lower()
                
                # If we have a real image filename (not placeholder)
                if filename and "placeholder" not in filename and filename in image_pool:
                    source_image = image_pool[filename]
                    
                    # Determine target path in assets (parallel to JSON in src-packs)
                    target_rel_dir = rel_dir.replace(os.sep, "/")
                    target_img_path = f"modules/witcher-compendium/assets/{target_rel_dir}/{os.path.basename(source_image)}"
                    target_abs_path = os.path.join(ASSETS_DIR, target_rel_dir.replace("/", os.sep), os.path.basename(source_image))
                    
                    # Update JSON if path changed
                    if data["img"] != target_img_path:
                        data["img"] = target_img_path
                        with open(fpath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, indent=4, ensure_ascii=False)
                        modified_jsons += 1
                        
                    # Copy image to target location
                    os.makedirs(os.path.dirname(target_abs_path), exist_ok=True)
                    if not os.path.exists(target_abs_path):
                        shutil.copy2(source_image, target_abs_path)
                        moved_files += 1
                
            except Exception as e:
                print(f"Error processing {file}: {e}")

    print(f"\nAlignment Completed:")
    print(f"JSON files updated: {modified_jsons}")
    print(f"Asset files copied/aligned: {moved_files}")

if __name__ == "__main__":
    align_v3()
