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
            if f.endswith(('.webp', '.png', '.jpg', '.jpeg')):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, os.path.join(ROOT, "witcher-compendium", "assets"))
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

    # 3. Find orphans (on disk but not referenced)
    orphans = []
    for path in disk_assets:
        if path not in referenced_assets:
            orphans.append(path)

    # 4. Find broken (referenced but not on disk)
    broken = []
    for path in referenced_assets:
        if path.startswith("modules/witcher-compendium/assets/") and path not in disk_assets:
            broken.append(path)

    print(f"Total Assets on Disk: {len(disk_assets)}")
    print(f"Total Referenced Assets: {len(referenced_assets)}")
    print(f"Orphan Assets (Unused): {len(orphans)}")
    print(f"Broken References (Missing): {len(broken)}")

    if orphans:
        print("\n--- Orphan Assets (First 10) ---")
        for o in orphans[:10]:
            print(o)
            
    if broken:
        print("\n--- Broken References (First 10) ---")
        for b in broken[:10]:
            print(b)

if __name__ == "__main__":
    find_orphans()
