import os
import json
import shutil
from PIL import Image

# Paths
ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
BANNERS_DIR = os.path.join(ROOT, "witcher-compendium", "assets", "BANNERS")
MODULE_JSON = os.path.join(ROOT, "witcher-compendium", "module.json")

# Source images from artifacts
SRC_MONSTERS = r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\banner_monsters_1776281312663.png"
SRC_PNG = r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\banner_png_1776281337351.png"
SRC_ANIMALS = r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\banner_animals_1776281357969.png"

# Mapping to pack names
MAPPINGS = {
    "witcher-monsters": (SRC_MONSTERS, "banner_monsters.webp"),
    "witcher-png": (SRC_PNG, "banner_png.webp"),
    "witcher-animals": (SRC_ANIMALS, "banner_animals.webp")
}

def setup_banners():
    os.makedirs(BANNERS_DIR, exist_ok=True)
    
    updates = {}
    
    # Process images
    for pack_name, (src_path, dest_name) in MAPPINGS.items():
        if os.path.exists(src_path):
            dest_path = os.path.join(BANNERS_DIR, dest_name)
            try:
                # Convert to WebP and save
                with Image.open(src_path) as img:
                    # Crop to a banner ratio if needed (approx 3:1 or 4:1)
                    # Let's just resize/crop to 900x250 to ensure strict banner proportions
                    w, h = img.size
                    target_w = 900
                    target_h = 250
                    
                    # Calculate aspect ratio
                    img_ratio = w / h
                    target_ratio = target_w / target_h
                    
                    if img_ratio > target_ratio:
                        # Image is wider
                        new_w = int(h * target_ratio)
                        offset = (w - new_w) // 2
                        img = img.crop((offset, 0, offset + new_w, h))
                    elif img_ratio < target_ratio:
                        # Image is taller
                        new_h = int(w / target_ratio)
                        offset = (h - new_h) // 2
                        img = img.crop((0, offset, w, offset + new_h))
                        
                    img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
                    img.save(dest_path, "WEBP", quality=85)
                    print(f"Processed: {dest_name}")
                    updates[pack_name] = f"modules/witcher-compendium/assets/BANNERS/{dest_name}"
            except Exception as e:
                print(f"Error processing {src_path}: {e}")
        else:
            print(f"Source not found: {src_path}")

    # Update module.json
    try:
        with open(MODULE_JSON, 'r', encoding='utf-8') as f:
            mod_data = json.load(f)
            
        packs = mod_data.get("packs", [])
        modified = False
        
        for pack in packs:
            name = pack.get("name")
            if name in updates:
                pack["banner"] = updates[name]
                modified = True
                print(f"Set banner for {name}")
                
        if modified:
            mod_data["packs"] = packs
            with open(MODULE_JSON, 'w', encoding='utf-8') as f:
                json.dump(mod_data, f, indent=2, ensure_ascii=False)
            print("module.json has been updated successfully.")
            
    except Exception as e:
        print(f"Error updating module.json: {e}")

if __name__ == "__main__":
    setup_banners()
