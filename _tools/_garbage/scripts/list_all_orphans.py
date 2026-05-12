import os
import json

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
ASSETS_ROOT = os.path.join(ROOT, "witcher-compendium", "assets")
SRC_PACKS_ROOT = os.path.join(ROOT, "_tools", "src-packs")

def find_orphans():
    # 1. Get all images on disk
    disk_assets = {}
    for root, dirs, files in os.walk(ASSETS_ROOT):
        for f in files:
            if f.lower().endswith(('.webp', '.png', '.jpg', '.jpeg')):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, ASSETS_ROOT)
                foundry_path = f"modules/witcher-compendium/assets/{rel_path.replace(os.sep, '/')}"
                disk_assets[foundry_path] = full_path

    # 2. Get all referenced images
    referenced_assets = set()
    for root, dirs, files in os.walk(SRC_PACKS_ROOT):
        for f in files:
            if f.endswith('.json'):
                try:
                    with open(os.path.join(root, f), 'r', encoding='utf-8-sig') as jf:
                        data = json.load(jf)
                        img = data.get("img")
                        if img:
                            referenced_assets.add(img)
                except:
                    pass

    # 3. Find orphans
    orphans = [p for p in disk_assets if p not in referenced_assets]
    
    with open(os.path.join(ROOT, "_tools", "all_orphans.txt"), "w", encoding="utf-8") as out:
        for o in sorted(orphans):
            out.write(o + "\n")
            
    print(f"Saved {len(orphans)} orphans to _tools/all_orphans.txt")

if __name__ == "__main__":
    find_orphans()
