import os
import re
import unicodedata
import json

# Paths
ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
TEMP_IMAGES = os.path.join(ROOT, "temp_images")
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")

def slugify(value):
    value = str(value)
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '_', value)

def normalize_filename(filename):
    name, ext = os.path.splitext(filename)
    name = re.sub(r'\(.*?\)', '', name)
    return slugify(name) + ".webp"

def run_audit():
    print("Avvio Audit temp_images vs assets...")
    
    # 1. Map all assets
    asset_map = set()
    for root, dirs, files in os.walk(ASSETS_DIR):
        for f in files:
            asset_map.add(f.lower())

    # 2. Audit temp_images
    to_delete = []
    missing_in_assets = []
    
    for root, dirs, files in os.walk(TEMP_IMAGES):
        for f in files:
            if not f.lower().endswith('.png'): continue
            
            norm_name = normalize_filename(f)
            if norm_name.lower() in asset_map:
                to_delete.append(os.path.join(root, f))
            else:
                missing_in_assets.append(os.path.join(root, f))

    # 3. Audit JSON pointers
    json_pointing_to_temp = []
    for root, dirs, files in os.walk(SRC_PACKS):
        for f in files:
            if not f.endswith(".json"): continue
            fpath = os.path.join(root, f)
            try:
                with open(fpath, 'r', encoding='utf-8-sig') as j:
                    data = json.load(j)
                img = data.get("img", "")
                if "temp_images" in img:
                    json_pointing_to_temp.append(f)
            except: pass

    print("\n--- Risultati Audit ---")
    print(f"File PNG in temp_images gia processati (pronti per pulizia): {len(to_delete)}")
    print(f"File PNG orfani (non ancora in assets): {len(missing_in_assets)}")
    print(f"JSON che puntano ancora a temp_images: {len(json_pointing_to_temp)}")
    
    if missing_in_assets:
        print("\nAvviso: Alcuni file in temp_images non sono ancora presenti in assets!")
        for m in missing_in_assets[:10]:
            print(f"  - {os.path.basename(m)}")
        if len(missing_in_assets) > 10: print(f"  ...e altri {len(missing_in_assets)-10}")

    if json_pointing_to_temp:
        print("\nErrore: Alcuni JSON puntano ancora a cartelle temporanee!")

        for j in json_pointing_to_temp[:10]:
            print(f"  - {j}")

    # Output list for the next step
    with open(os.path.join(ROOT, "_tools", "reports", "temp_cleanup_list.txt"), "w") as f:
        for item in to_delete:
            f.write(item + "\n")

if __name__ == "__main__":
    run_audit()
