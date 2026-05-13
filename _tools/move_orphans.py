import os
import json
import shutil

def move_orphans(assets_dir, json_dir, target_dir):
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        
    # 1. Collect all images in assets
    all_images = set()
    img_extensions = ('.webp', '.png', '.jpg', '.jpeg', '.svg')
    
    for root, dirs, files in os.walk(assets_dir):
        # Skip the target dir if it's inside assets (unlikely here but safe)
        if os.path.abspath(root).startswith(os.path.abspath(target_dir)):
            continue
            
        for file in files:
            if file.lower().endswith(img_extensions):
                full_path = os.path.abspath(os.path.join(root, file))
                all_images.add(full_path)
    
    # 2. Collect all referenced images in JSONs
    referenced_images = set()
    prefix = "modules/witcher-compendium/assets/"
    
    for root, dirs, files in os.walk(json_dir):
        for file in files:
            if file.endswith(".json"):
                full_path = os.path.join(root, file)
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        def extract_img(obj):
                            if isinstance(obj, dict):
                                for k, v in obj.items():
                                    if k == 'img' and isinstance(v, str):
                                        if v.startswith(prefix):
                                            rel_path = v[len(prefix):]
                                            abs_path = os.path.abspath(os.path.join(assets_dir, rel_path.replace('/', os.sep)))
                                            referenced_images.add(abs_path)
                                    else:
                                        extract_img(v)
                            elif isinstance(obj, list):
                                for item in obj:
                                    extract_img(item)
                        extract_img(data)
                except Exception:
                    pass
    
    # 3. Move orphans
    moved_count = 0
    for img in all_images:
        if img not in referenced_images:
            try:
                # Create a filename that includes the original folder to avoid collisions in temp_images
                rel_path = os.path.relpath(img, assets_dir).replace(os.sep, '__')
                target_path = os.path.join(target_dir, rel_path)
                
                shutil.move(img, target_path)
                moved_count += 1
                print(f"Moved: {os.path.basename(img)} -> temp_images/{rel_path}")
            except Exception as e:
                print(f"Failed to move {img}: {e}")
                
    return moved_count

if __name__ == "__main__":
    assets_path = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets"
    jsons_path = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs"
    temp_path = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\temp_images"
    
    count = move_orphans(assets_path, jsons_path, temp_path)
    print(f"\nTask complete. Moved {count} orphan assets to temp_images for review.")
