import os
import json
import re

src_packs_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs"
monsters_dir = os.path.join(src_packs_dir, "BESTIARIO", "witcher-monsters")
animals_dir = os.path.join(src_packs_dir, "BESTIARIO", "witcher-animals")

# 1. Build dictionary of all standalone items
# Key: normalized item name (lowercase, stripped of spaces/special chars)
# Value: dict with "name", "img", "type", "file_path", "data"
standalone_items = {}

def normalize_name(name):
    # Remove suffix like (x1), (x1d6), (x 1d6), (x 2), (x1d6/2), (x3d6)
    name = re.sub(r'\s*\(\s*x[^\)]+\)\s*$', '', name, flags=re.IGNORECASE)
    # Remove leading/trailing whitespaces and lowercase
    return name.strip().lower()

for root, dirs, files in os.walk(src_packs_dir):
    # Skip BESTIARIO
    if "BESTIARIO" in root:
        continue
    for file in files:
        if not file.endswith(".json"):
            continue
        file_path = os.path.join(root, file)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            name = data.get("name")
            img = data.get("img")
            itype = data.get("type")
            if name:
                norm = normalize_name(name)
                standalone_items[norm] = {
                    "name": name,
                    "img": img,
                    "type": itype,
                    "file_path": file_path,
                    "data": data
                }
        except Exception as e:
            print(f"Error reading {file_path}: {e}")

print(f"Total standalone items indexed: {len(standalone_items)}")

# 2. Analyze monster and animal items
monster_files = []
for file in os.listdir(monsters_dir):
    if file.endswith(".json"):
        monster_files.append(os.path.join(monsters_dir, file))
for file in os.listdir(animals_dir):
    if file.endswith(".json"):
        monster_files.append(os.path.join(animals_dir, file))

matches = 0
mismatches = 0
no_match = 0
total_items = 0

for m_file in monster_files:
    try:
        with open(m_file, "r", encoding="utf-8") as f:
            m_data = json.load(f)
        items = m_data.get("items", [])
        for item in items:
            name = item.get("name")
            img = item.get("img")
            itype = item.get("type")
            
            # Skip trophies (already mapped and handled)
            if name.startswith("Trofeo:"):
                continue
                
            # Skip capabilities/traits (e.g. "[Capacità] Volo", "Artigli", "Morso")
            if name.startswith("[Capacità]") or name.startswith("[Capacit]") or name.strip() in ["Artigli", "Morso", "Zoccoli", "Zoccoli / Morso"]:
                continue
                
            total_items += 1
            norm = normalize_name(name)
            if norm in standalone_items:
                match_info = standalone_items[norm]
                if img != match_info["img"]:
                    print(f"MISMATCH in {os.path.basename(m_file)}: '{name}' -> current img: '{img}', standalone img: '{match_info['img']}'")
                    mismatches += 1
                else:
                    matches += 1
            else:
                print(f"NO MATCH in {os.path.basename(m_file)}: '{name}' (normalized: '{norm}') - current img: '{img}'")
                no_match += 1
    except Exception as e:
        print(f"Error reading {m_file}: {e}")

print(f"\nSummary:")
print(f"Total items analyzed (excluding Trofei & traits): {total_items}")
print(f"Matches with same img: {matches}")
print(f"Mismatches (different img): {mismatches}")
print(f"No match at all: {no_match}")
