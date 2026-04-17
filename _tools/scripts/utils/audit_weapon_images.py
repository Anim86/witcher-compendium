import os
import json

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
WEAPON_JSON_DIR = os.path.join(ROOT, "_tools", "src-packs", "EQUIPAGGIAMENTO_E_TRASPORTI", "Armi_e_Armature", "witcher-weapons")
WEAPON_RACCONTI_JSON_DIR = os.path.join(ROOT, "_tools", "src-packs", "EQUIPAGGIAMENTO_E_TRASPORTI", "Armi_e_Armature", "witcher-weapons-racconti")
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")

def resolve_path(img_path):
    # e.g., modules/witcher-compendium/assets/EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/spada_berserker.webp
    if img_path.startswith("modules/witcher-compendium/assets/"):
        rel_path = img_path.replace("modules/witcher-compendium/assets/", "").replace("/", os.sep)
        return os.path.join(ASSETS_DIR, rel_path)
    return None

def audit_weapons():
    missing_images = []
    
    dirs_to_check = [WEAPON_JSON_DIR, WEAPON_RACCONTI_JSON_DIR]
    
    for d in dirs_to_check:
        if not os.path.exists(d):
            continue
            
        for filename in os.listdir(d):
            if filename.endswith(".json"):
                filepath = os.path.join(d, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    try:
                        data = json.load(f)
                    except json.JSONDecodeError:
                        continue
                        
                    name = data.get("name", "Unknown")
                    img = data.get("img", "")
                    
                    # Check if standard foundry generic icon
                    if img.startswith("icons/") or "item-bag.svg" in img:
                        missing_images.append((name, img, filepath, "Generic Icon"))
                        continue
                        
                    # Resolve to local path and check existence
                    phys_path = resolve_path(img)
                    if phys_path:
                        if not os.path.exists(phys_path):
                            missing_images.append((name, img, filepath, "File Not Found (Broken Path)"))
                    else:
                        missing_images.append((name, img, filepath, "External or Unrecognized Path"))

    print(f"Total Weapons Audited: ...")
    print(f"Total Missing Images: {len(missing_images)}")
    print("-" * 50)
    for w in missing_images:
        print(f"Weapon: {w[0]}")
        print(f"Current Path: {w[1]}")
        print(f"Reason: {w[3]}")
        print("-" * 50)

if __name__ == "__main__":
    audit_weapons()
