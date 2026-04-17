import os
import json

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
MODULE_JSON = os.path.join(ROOT, "witcher-compendium", "module.json")

def fix_png_banner():
    try:
        with open(MODULE_JSON, 'r', encoding='utf-8') as f:
            mod_data = json.load(f)
            
        packs = mod_data.get("packs", [])
        modified = False
        
        for pack in packs:
            if pack.get("name") == "witcher-png":
                pack["banner"] = "modules/witcher-compendium/images/banners/banner_png.webp"
                modified = True
                print("Injected banner for witcher-png")
                break
                
        if modified:
            with open(MODULE_JSON, 'w', encoding='utf-8') as f:
                json.dump(mod_data, f, indent=2, ensure_ascii=False)
            print("module.json has been updated successfully.")
        else:
            print("witcher-png pack not found in module.json")
            
    except Exception as e:
        print(f"Error updating module.json: {e}")

if __name__ == "__main__":
    fix_png_banner()
