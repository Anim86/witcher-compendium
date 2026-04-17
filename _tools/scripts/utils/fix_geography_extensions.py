import os
import json

ROOT_DIR = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACKS_GEOGRAPHY = os.path.join(ROOT_DIR, "_tools", "src-packs", "REGOLAMENTO_E_NARRATIVA", "Geografia", "witcher-geografia")
ASSETS_GEOGRAPHY = r"E:\FoundryVTT_Data\Data\modules\witcher-compendium\assets\REGOLAMENTO_E_NARRATIVA\Geografia\witcher-geografia"

def fix_extensions():
    if not os.path.exists(SRC_PACKS_GEOGRAPHY):
        print(f"Error: Path not found {SRC_PACKS_GEOGRAPHY}")
        return

    updated_count = 0
    missing_count = 0

    for filename in os.listdir(SRC_PACKS_GEOGRAPHY):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(SRC_PACKS_GEOGRAPHY, filename)
        
        try:
            with open(filepath, "r", encoding="utf-8-sig") as f:
                data = json.load(f)
        except Exception as e:
            print(f"Error reading {filename}: {e}")
            continue

        current_img = data.get("img", "")
        if not current_img:
            continue

        # Extract just the filename from the path
        img_filename = os.path.basename(current_img)
        img_base, _ = os.path.splitext(img_filename)

        # Check in the geography asset folder
        found = False
        for ext in [".webp", ".png", ".jpg", ".jpeg"]:
            test_file = f"{img_base}{ext}"
            if os.path.exists(os.path.join(ASSETS_GEOGRAPHY, test_file)):
                new_img = f"modules/witcher-compendium/assets/REGOLAMENTO_E_NARRATIVA/Geografia/witcher-geografia/{test_file}"
                if current_img != new_img:
                    data["img"] = new_img
                    with open(filepath, "w", encoding="utf-8") as f:
                        json.dump(data, f, indent=4, ensure_ascii=False)
                    print(f"Updated {filename}: {current_img} -> {new_img}")
                    updated_count += 1
                found = True
                break
        
        if not found:
            print(f"Warning: Asset NOT FOUND for {filename} (ID: {data.get('name')}) - Expected: {img_base}.webp/png")
            missing_count += 1

    print(f"\nSummary: Updated {updated_count} files. {missing_count} assets still missing.")

if __name__ == "__main__":
    fix_extensions()
