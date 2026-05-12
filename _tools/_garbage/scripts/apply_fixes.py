import json
import os

with open('_tools/potential_fixes.json', 'r', encoding='utf-8') as f:
    fixes = json.load(f)

for fix in fixes:
    json_path = fix['json_file']
    # Use the first match as the new path
    new_img_path = "modules/" + fix['potential_matches'][0]
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    data['img'] = new_img_path
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print(f"Updated {fix['name']} in {os.path.basename(json_path)} to {new_img_path}")
