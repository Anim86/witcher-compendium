import os
import re
import json

asset_path = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\BESTIARIO\MOSTRI"
json_root = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO"

# Mapping to keep track of changes for JSON updates
mapping = {}

def rename_assets():
    count = 0
    if not os.path.exists(asset_path):
        print(f"Path not found: {asset_path}")
        return
        
    files = [f for f in os.listdir(asset_path) if f.endswith(".webp")]
    
    for filename in files:
        # Expected pattern: PagXXX_Name_01.webp
        parts = filename.split("_")
        
        if len(parts) >= 3:
            name_part = parts[1]
            new_name = name_part.replace(" ", "_").strip()
            final_filename = f"{new_name}.webp"
            
            old_path = os.path.join(asset_path, filename)
            new_path = os.path.join(asset_path, final_filename)
            
            if os.path.exists(new_path) and filename != final_filename:
                print(f"Warning: {final_filename} already exists, skipping {filename}")
                # Still add to mapping so we can fix JSONs if they point to the old name
                mapping[filename] = final_filename
            else:
                if filename != final_filename:
                    os.rename(old_path, new_path)
                    print(f"Renamed Asset: {filename} -> {final_filename}")
                mapping[filename] = final_filename
                count += 1
        else:
            print(f"Skipping asset {filename}: no pattern match")
    return count

def update_jsons():
    count = 0
    for root, dirs, files in os.walk(json_root):
        for file in files:
            if file.endswith(".json"):
                file_path = os.path.join(root, file)
                changed = False
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    for old_name, new_name in mapping.items():
                        if old_name in new_content:
                            new_content = new_content.replace(old_name, new_name)
                            changed = True
                    
                    if changed:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated JSON: {file}")
                        count += 1
                except Exception as e:
                    print(f"Error updating {file}: {e}")
    return count

if __name__ == "__main__":
    assets_renamed = rename_assets()
    jsons_updated = update_jsons()
    print(f"\nSummary:")
    print(f"Assets renamed: {assets_renamed}")
    print(f"JSON files updated: {jsons_updated}")
