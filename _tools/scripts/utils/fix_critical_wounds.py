import os
import json

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACK = os.path.join(ROOT, "_tools", "src-packs", "REGOLAMENTO_E_NARRATIVA", "Ferite_Critiche", "witcher-critical-wounds")
BASE_IMG_PATH = "modules/witcher-compendium/assets/REGOLAMENTO_E_NARRATIVA/Ferite_Critiche/witcher-critical-wounds/"

MAPPING = {
    "frattura.webp": ["frattura", "incrinat", "rotte"],
    "decapitazione.webp": ["decapitazione"],
    "interna.webp": ["danni", "lesionata", "shock", "lacerato", "milza", "stomaco"],
    "testa.webp": ["testa", "mascella", "occhio", "pneumo", "sfregio", "spina", "cervello"]
}

def fix_critical_wounds():
    if not os.path.exists(SRC_PACK):
        print("Source pack not found.")
        return

    files = [f for f in os.listdir(SRC_PACK) if f.endswith(".json")]
    updated_count = 0

    for f in files:
        path = os.path.join(SRC_PACK, f)
        with open(path, 'r', encoding='utf-8-sig') as jf:
            data = json.load(jf)
        
        name_lower = data.get("name", "").lower()
        target_img = "testa.webp" # Default fallback
        
        found = False
        for img, keywords in MAPPING.items():
            if any(k in name_lower for k in keywords):
                target_img = img
                found = True
                break
        
        new_img_path = f"{BASE_IMG_PATH}{target_img}"
        
        if data.get("img") != new_img_path:
            data["img"] = new_img_path
            with open(path, 'w', encoding='utf-8') as jf:
                json.dump(data, jf, indent=4, ensure_ascii=False)
            updated_count += 1
            print(f"Updated {data['name']} -> {target_img}")

    print(f"\nTotal items updated: {updated_count}")

if __name__ == "__main__":
    fix_critical_wounds()
