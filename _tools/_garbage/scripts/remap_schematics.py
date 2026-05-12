import json
import os
import re

def normalize_name(name):
    name = name.replace('Schema:', '').replace('schema:', '').strip()
    name = re.sub(r'[^a-z0-9]', '_', name.lower())
    for filler in ['da_', 'di_', 'del_', 'd_', 'degli_', 'delle_', 'lo_', 'la_', 'il_', 'gli_', 'le_']:
        name = name.replace(filler, '')
    name = re.sub(r'_+', '_', name).strip('_')
    return name

with open('_tools/truly_missing.json', 'r', encoding='utf-8') as f:
    missing = json.load(f)

with open('_tools/all_webp_files.txt', 'r', encoding='utf-16') as f:
    all_webp = [line.strip() for line in f.readlines() if line.strip()]

# Map of normalized name -> relative path (modules/...)
asset_map = {}
for path in all_webp:
    rel_path = path.replace('C:\\Users\\apaci\\Desktop\\Script\\witcher-compendium-main\\', '').replace('\\', '/')
    basename = os.path.basename(path)
    name_without_ext = os.path.splitext(basename)[0]
    norm = normalize_name(name_without_ext)
    if norm not in asset_map:
        asset_map[norm] = []
    asset_map[norm].append(rel_path)

schematic_fixes = []

for item in missing:
    if item['pack'] == 'witcher-schematics':
        norm_name = normalize_name(item['name'])
        if norm_name in asset_map:
            # We found matches!
            matches = asset_map[norm_name]
            # Prioritize weapons/armor folders
            best_match = None
            for m in matches:
                if 'Armi_e_Armature' in m:
                    best_match = m
                    break
            if not best_match:
                best_match = matches[0]
            
            schematic_fixes.append({
                "name": item['name'],
                "json_file": item['json_file'],
                "new_img": "modules/" + best_match
            })

print(f"Found {len(schematic_fixes)} schematics that can be re-mapped to existing item icons.")

for fix in schematic_fixes:
    with open(fix['json_file'], 'r', encoding='utf-8') as f:
        data = json.load(f)
    data['img'] = fix['new_img']
    with open(fix['json_file'], 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"Remapped {fix['name']} to {fix['new_img']}")
