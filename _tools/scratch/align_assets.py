import os
import json
import shutil
import re

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")
ASSETS_DEST = os.path.join(ROOT, "witcher-compendium", "assets")
IMAGES_SRC = os.path.join(ROOT, "images")

# Map of clean name to source image path
image_map = {}
if os.path.exists(IMAGES_SRC):
    for f in os.listdir(IMAGES_SRC):
        if f.endswith(".webp"):
            clean_name = f.replace(".webp", "").lower()
            image_map[clean_name] = os.path.join(IMAGES_SRC, f)

print(f"Loaded {len(image_map)} images from {IMAGES_SRC}")

def get_clean_name(filename):
    # Pattern: PagXXX_Name_XX.webp -> Name
    # Or just Name.webp -> Name
    name = filename.replace(".webp", "")
    # Try to extract the name part from PagXXX_Name_XX
    match = re.search(r"Pag\d+_(.+?)_\d+", name)
    if match:
        name = match.group(1)
    return name.replace(" ", "_").lower()

stats = {"total_files": 0, "assets_found": 0, "copied": 0}

for root, dirs, files in os.walk(SRC_PACKS):
    for file in files:
        if not file.endswith(".json"):
            continue
        
        stats["total_files"] += 1
        fpath = os.path.join(root, file)
        
        try:
            with open(fpath, 'r', encoding='utf-8-sig') as f:
                content = f.read()
                if not content.strip():
                    continue
                data = json.loads(content)
            
            img_path = data.get("img", "")
            if not isinstance(img_path, str) or not img_path.startswith("modules/witcher-compendium/assets/"):
                continue
            
            # Target relative path in assets
            rel_path = img_path.replace("modules/witcher-compendium/assets/", "")
            target_abs_path = os.path.join(ASSETS_DEST, rel_path.replace("/", os.sep))
            
            # Source file name in JSON
            json_filename = os.path.basename(img_path)
            clean_name = get_clean_name(json_filename)
            
            if clean_name in image_map:
                stats["assets_found"] += 1
                source_image = image_map[clean_name]
                
                # Make sure destination directory exists
                dest_dir = os.path.dirname(target_abs_path)
                os.makedirs(dest_dir, exist_ok=True)
                
                # Copy the image to the EXACT NAME in the JSON
                shutil.copy2(source_image, target_abs_path)
                # print(f"Aligned: {json_filename} <- {os.path.basename(source_image)}")
                stats["copied"] += 1
            
        except Exception as e:
            # print(f"Error processing {file}: {e}")
            pass

print(f"\nAlignment Complete:")
print(f"Total JSON files scanned: {stats['total_files']}")
print(f"Assets matching images folder: {stats['assets_found']}")
print(f"Files copied to assets: {stats['copied']}")
