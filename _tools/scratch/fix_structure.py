import os
import json
import shutil

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")
MODULE_JSON = os.path.join(ROOT, "witcher-compendium", "module.json")

def align_structure():
    with open(MODULE_JSON, 'r', encoding='utf-8') as f:
        module_data = json.load(f)
    
    packs = module_data.get("packs", [])
    pack_map = {p["name"]: p["path"].replace("packs/", "") for p in packs}
    
    print(f"Loaded {len(packs)} pack definitions.")
    
    # We'll specifically target the misplaced files in BESTIARIO/MOSTRI and move them to their correct packs
    misplaced_dir = os.path.join(SRC_PACKS, "BESTIARIO", "MOSTRI")
    if not os.path.exists(misplaced_dir):
        print("BESTIARIO/MOSTRI not found. Maybe already aligned?")
        return

    moved_count = 0
    for filename in os.listdir(misplaced_dir):
        if not filename.endswith(".json"):
            continue
            
        fpath = os.path.join(misplaced_dir, filename)
        with open(fpath, 'r', encoding='utf-8-sig') as f:
            try:
                data = json.load(f)
            except:
                continue
        
        # Decide which pack it belongs to
        img = data.get("img", "")
        sourcebook = data.get("system", {}).get("sourcebook", "")
        
        target_pack = "witcher-monsters" # Default
        if "caos" in img.lower() or "tc" in sourcebook.lower():
            target_pack = "witcher-monsters-chaos"
        elif "racconti" in img.lower() or "r " in sourcebook.lower():
            target_pack = "witcher-monsters-racconti"
        elif "diario" in img.lower() or "d " in sourcebook.lower():
            target_pack = "witcher-monsters-diario"
            
        if target_pack in pack_map:
            dest_rel_path = pack_map[target_pack]
            dest_dir = os.path.join(SRC_PACKS, dest_rel_path.replace("/", os.sep))
            os.makedirs(dest_dir, exist_ok=True)
            
            shutil.move(fpath, os.path.join(dest_dir, filename))
            # print(f"Moved {filename} -> {target_pack}")
            moved_count += 1

    print(f"Moved {moved_count} monsters to their correct pack folders.")

    # Cleanup empty MOSTRI dir
    try:
        if not os.listdir(misplaced_dir):
            os.rmdir(misplaced_dir)
            print("Removed empty BESTIARIO/MOSTRI directory.")
    except:
        pass

if __name__ == "__main__":
    align_structure()
