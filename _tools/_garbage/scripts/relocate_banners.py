import os
import json
import shutil

# Paths
ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
OLD_BANNERS_DIR = os.path.join(ROOT, "witcher-compendium", "assets", "BANNERS")
NEW_BANNERS_DIR = os.path.join(ROOT, "witcher-compendium", "images", "banners")
MODULE_JSON = os.path.join(ROOT, "witcher-compendium", "module.json")

def relocate_banners():
    # 1. Create the new directory
    os.makedirs(NEW_BANNERS_DIR, exist_ok=True)
    
    # 2. Move files from old directory to new directory
    if os.path.exists(OLD_BANNERS_DIR):
        for filename in os.listdir(OLD_BANNERS_DIR):
            old_path = os.path.join(OLD_BANNERS_DIR, filename)
            new_path = os.path.join(NEW_BANNERS_DIR, filename)
            shutil.move(old_path, new_path)
            print(f"Moved {filename} to {NEW_BANNERS_DIR}")
        
        # Remove old directory
        try:
            os.rmdir(OLD_BANNERS_DIR)
            print(f"Removed old directory {OLD_BANNERS_DIR}")
        except Exception as e:
            print(f"Could not remove old directory (might not be empty): {e}")

    # 3. Update module.json
    try:
        with open(MODULE_JSON, 'r', encoding='utf-8') as f:
            mod_data = json.load(f)
            
        packs = mod_data.get("packs", [])
        modified = False
        
        for pack in packs:
            banner = pack.get("banner", "")
            if "assets/BANNERS/" in banner:
                new_banner = banner.replace("assets/BANNERS/", "images/banners/")
                pack["banner"] = new_banner
                modified = True
                print(f"Updated banner path for {pack['name']} -> {new_banner}")
                
        if modified:
            mod_data["packs"] = packs
            with open(MODULE_JSON, 'w', encoding='utf-8') as f:
                json.dump(mod_data, f, indent=2, ensure_ascii=False)
            print("module.json has been updated successfully with new banner paths.")
            
    except Exception as e:
        print(f"Error updating module.json: {e}")

if __name__ == "__main__":
    relocate_banners()
