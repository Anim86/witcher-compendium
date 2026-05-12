import os
import json
from PIL import Image

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
INPUT_PATH = os.path.join(ROOT, "temp_images", "gioco_dazzardo.png")
OUTPUT_DIR = os.path.join(ROOT, "witcher-compendium", "assets", "REGOLAMENTO_E_NARRATIVA", "Professioni_e_Abilita", "witcher-skills")
JSON_PATH = os.path.join(ROOT, "_tools", "src-packs", "REGOLAMENTO_E_NARRATIVA", "Professioni_e_Abilita", "witcher-skills", "gioco_dazzardo_12fe74d0e5001799.json")

def process():
    if not os.path.exists(INPUT_PATH):
        print(f"Error: Input file not found {INPUT_PATH}")
        return

    # 1. Optimize and Resize
    print(f"Optimizing {INPUT_PATH}...")
    with Image.open(INPUT_PATH) as img:
        img = img.convert("RGBA")
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        
        output_file = os.path.join(OUTPUT_DIR, "gioco_dazzardo.webp")
        img.save(output_file, "WEBP", quality=90)
        print(f"Saved to {output_file}")

    # 2. Update JSON
    if os.path.exists(JSON_PATH):
        print(f"Updating JSON {JSON_PATH}...")
        with open(JSON_PATH, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
        
        data["img"] = "modules/witcher-compendium/assets/REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills/gioco_dazzardo.webp"
        
        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print("JSON updated successfully!")
    else:
        print(f"Error: JSON not found {JSON_PATH}")

if __name__ == "__main__":
    process()
