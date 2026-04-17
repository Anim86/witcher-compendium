import os
import json
import shutil

# Paths
ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")
GEO_DIR = os.path.join(ASSETS_DIR, "GEOGRAFIA")
PNG_DIR = os.path.join(ASSETS_DIR, "BESTIARIO", "PNG")
LORE_ASSETS_DIR = os.path.join(ASSETS_DIR, "LORE", "base", "witcher-lore")
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")

# Geography assets to relocate
GEO_FILES = [
    "attre.webp", "ebbing.webp", "gemmera.webp", "il_cuore_di_nilfgaard.webp",
    "nazair.webp", "skellige.webp", "verden.webp", "zerrikania.webp",
    "aedirn.webp", "dol_blathanna.webp", "kaedwen.webp", "mahakam.webp",
    "redania.webp", "temeria.webp"
]

def fix_geography():
    os.makedirs(GEO_DIR, exist_ok=True)
    
    # 1. Move files
    for f in GEO_FILES:
        # Check in PNG
        src_png = os.path.join(PNG_DIR, f)
        if os.path.exists(src_png):
            shutil.move(src_png, os.path.join(GEO_DIR, f))
            print(f"Moved {f} from PNG to GEOGRAFIA")
        
        # Check in Lore
        src_lore = os.path.join(LORE_ASSETS_DIR, f)
        if os.path.exists(src_lore):
            shutil.move(src_lore, os.path.join(GEO_DIR, f))
            print(f"Moved {f} from LORE to GEOGRAFIA")

    # 2. Update JSONs
    print("Updating JSON references...")
    for root, _, filenames in os.walk(SRC_PACKS):
        for f in filenames:
            if f.endswith(".json"):
                json_path = os.path.join(root, f)
                modified = False
                try:
                    with open(json_path, 'r', encoding='utf-8-sig') as jf:
                        data = json.load(jf)
                    
                    img = data.get("img", "")
                    
                    # If it points to one of our geo files, update to the new path
                    for gf in GEO_FILES:
                        if gf in img:
                            # Re-verify if it SHOULD point to GEOGRAFIA
                            # If it's Artorius or someone, we don't change it (but they are not in GEO_FILES)
                            
                            # Specific Reverts for incorrect matches
                            if "aard_" in f or "zerrikaniano" in f:
                                # These will be fixed by the normalization script later
                                pass
                            else:
                                new_img = f"modules/witcher-compendium/assets/GEOGRAFIA/{gf}"
                                if img != new_img:
                                    data["img"] = new_img
                                    modified = True
                    
                    if modified:
                        with open(json_path, 'w', encoding='utf-8') as jf:
                            json.dump(data, jf, indent=4, ensure_ascii=False)
                        print(f"Updated: {f}")
                except Exception as e:
                    pass

    print("Geography relocation complete.")

if __name__ == "__main__":
    fix_geography()
