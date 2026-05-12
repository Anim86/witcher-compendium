import json
import os
import re

def normalize_name(name):
    name = os.path.splitext(name)[0].lower()
    # Replace common Italian articles and prepositions
    name = name.replace('Schema:', '').replace('schema:', '')
    name = re.sub(r'[^a-z0-9]', '_', name)
    # Remove common filler words
    for filler in ['da_', 'di_', 'del_', 'd_', 'degli_', 'delle_', 'lo_', 'la_', 'il_', 'gli_', 'le_']:
        name = name.replace(filler, '')
    name = name.replace('acciaio', 'acc').replace('argento', 'arg') # Common abbreviations
    name = re.sub(r'_+', '_', name).strip('_')
    return name

with open('_tools/broken_images_audit.json', 'r', encoding='utf-8') as f:
    broken_images = json.load(f)

with open('_tools/all_webp_files.txt', 'r', encoding='utf-16') as f:
    all_webp = [line.strip() for line in f.readlines() if line.strip()]

asset_map = {}
for path in all_webp:
    basename = os.path.basename(path)
    norm = normalize_name(basename)
    if norm not in asset_map:
        asset_map[norm] = []
    asset_map[norm].append(path)

fixes = []
still_missing = []

for item in broken_images:
    expected_path = item['img_path']
    item_name = item['name']
    
    norm_path = normalize_name(os.path.basename(expected_path))
    norm_name = normalize_name(item_name)
    
    matches = set()
    if norm_path in asset_map:
        for m in asset_map[norm_path]: matches.add(m)
    if norm_name in asset_map:
        for m in asset_map[norm_name]: matches.add(m)
        
    if matches:
        fixes.append({
            "name": item_name,
            "json_file": item['json_file'],
            "current_img": expected_path,
            "potential_matches": [m.replace('C:\\Users\\apaci\\Desktop\\Script\\witcher-compendium-main\\', '').replace('\\', '/') for m in matches]
        })
    else:
        still_missing.append(item)

with open('_tools/potential_fixes.json', 'w', encoding='utf-8') as f:
    json.dump(fixes, f, indent=4)

with open('_tools/truly_missing.json', 'w', encoding='utf-8') as f:
    json.dump(still_missing, f, indent=4)

print(f"Found {len(fixes)} potential fixes and {len(still_missing)} truly missing assets.")
