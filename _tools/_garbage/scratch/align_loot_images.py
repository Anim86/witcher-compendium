import os
import json
import re

src_packs_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs"
monsters_dir = os.path.join(src_packs_dir, "BESTIARIO", "witcher-monsters")
animals_dir = os.path.join(src_packs_dir, "BESTIARIO", "witcher-animals")

# 1. Build dictionary of all standalone items
standalone_items = {}

def normalize_name(name):
    # Remove suffix like (x1), (x1d6), (x 1d6), (x 2), (x1d6/2), (x3d6)
    name = re.sub(r'\s*\(\s*x[^\)]+\)\s*$', '', name, flags=re.IGNORECASE)
    # Remove leading/trailing whitespaces and lowercase
    return name.strip().lower()

def find_synonym_match(norm_name, standalone_items):
    if norm_name in standalone_items:
        return norm_name
        
    synonym_rules = [
        (r'\bocchio\b', 'occhi'),
        (r'\bcorna\b', 'corno'),
        (r'\bdenti\b', 'zanne'),
        (r'\bpenne\b', 'piume'),
        (r'\bpenna\b', 'piume'),
    ]
    
    for pattern, replacement in synonym_rules:
        alt_name = re.sub(pattern, replacement, norm_name)
        if alt_name in standalone_items:
            return alt_name
            
        alt_name_rev = re.sub(replacement, pattern.replace(r'\b', ''), norm_name)
        if alt_name_rev in standalone_items:
            return alt_name_rev
            
    return None

for root, dirs, files in os.walk(src_packs_dir):
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
                    "data": data
                }
        except Exception as e:
            print(f"Error reading {file_path}: {e}")

print(f"Total standalone items indexed: {len(standalone_items)}")

# 2. Process monster and animal files
monster_files = []
for file in os.listdir(monsters_dir):
    if file.endswith(".json"):
        monster_files.append((monsters_dir, file))
for file in os.listdir(animals_dir):
    if file.endswith(".json"):
        monster_files.append((animals_dir, file))

aligned_count = 0
unmatched_items = set()

for m_dir, m_filename in monster_files:
    file_path = os.path.join(m_dir, m_filename)
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            m_data = json.load(f)
        
        items = m_data.get("items", [])
        updated = False
        
        for item in items:
            name = item.get("name")
            img = item.get("img")
            
            if name.startswith("Trofeo:") or name.startswith("[Capacità]") or name.startswith("[Capacit]") or name.strip() in ["Artigli", "Morso", "Zoccoli", "Zoccoli / Morso"]:
                continue
                
            norm = normalize_name(name)
            matched_key = find_synonym_match(norm, standalone_items)
            
            if matched_key:
                match_info = standalone_items[matched_key]
                if img != match_info["img"]:
                    old_img = img
                    item["img"] = match_info["img"]
                    if item.get("type") != match_info["type"]:
                        item["type"] = match_info["type"]
                    print(f"[{m_filename}] Aligned '{name}' (via '{matched_key}'): '{old_img}' -> '{match_info['img']}' (type -> {match_info['type']})")
                    updated = True
                    aligned_count += 1
            else:
                unmatched_items.add((name, m_filename))
                
        if updated:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(m_data, f, indent=4, ensure_ascii=False)
                
    except Exception as e:
        print(f"Error processing {m_filename}: {e}")

print(f"\nSuccessfully aligned {aligned_count} item images!")
