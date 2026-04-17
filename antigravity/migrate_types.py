import os
import json

root_dir = r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'
modified_count = 0

type_mapping = {
    'item': 'valuable',
    'Actor': 'character',
    'npc': 'character'
}

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.json'):
            path = os.path.join(root, file)
            modified = False
            try:
                with open(path, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                
                if 'type' in data and data['type'] in type_mapping:
                    old_type = data['type']
                    data['type'] = type_mapping[old_type]
                    modified = True
                    # Update modification time to trigger Foundry caches if needed
                    # System doesn't necessarily need it, but it's good practice
                
                if modified:
                    with open(path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=4)
                    modified_count += 1
            except Exception as e:
                print(f"Error processing {path}: {e}")

print(f"Migration completed. Modified {modified_count} files.")
