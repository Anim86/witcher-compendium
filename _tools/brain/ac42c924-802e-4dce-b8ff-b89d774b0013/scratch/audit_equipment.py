import os
import json

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs", "EQUIPAGGIAMENTO", "base", "witcher-equipment")
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")

def check_images():
    broken = []
    placeholders = []
    all_items = []
    
    for f in os.listdir(SRC_PACKS):
        if not f.endswith(".json"): continue
        fpath = os.path.join(SRC_PACKS, f)
        with open(fpath, 'r', encoding='utf-8') as j:
            data = json.load(j)
            img = data.get("img", "")
            name = data.get("name", "")
            
            rel_p = img.replace("modules/witcher-compendium/", "").replace("/", os.sep)
            abs_p = os.path.join(ROOT, "witcher-compendium", rel_p)
            
            status = "OK"
            if not os.path.exists(abs_p):
                status = "BROKEN"
                broken.append((name, img))
            elif "placeholder" in img.lower() or "gift_" in img.lower() or "trait_generico" in img.lower():
                status = "PLACEHOLDER/GENERIC"
                placeholders.append((name, img))
            
            all_items.append({
                "name": name,
                "img": img,
                "status": status
            })
            
    print(f"Total items: {len(all_items)}")
    print(f"Broken items: {len(broken)}")
    print(f"Placeholder/Generic: {len(placeholders)}")
    
    if broken:
        print("\n--- BROKEN ---")
        for n, i in broken:
            print(f"- {n}: {i}")
            
    if placeholders:
        print("\n--- PLACEHOLDER/GENERIC ---")
        for n, i in placeholders:
            print(f"- {n}: {i}")

if __name__ == "__main__":
    check_images()
