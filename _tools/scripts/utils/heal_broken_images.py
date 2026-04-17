import os
import json

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
ASSETS_ROOT = os.path.join(ROOT, "witcher-compendium", "assets")
AUDIT_FILE = os.path.join(ROOT, "_tools", "broken_images_audit.json")

def heal_all_images():
    if not os.path.exists(AUDIT_FILE):
        print("Audit file not found.")
        return

    with open(AUDIT_FILE, 'r', encoding='utf-8') as f:
        broken_entries = json.load(f)
    
    # Pre-build path map for efficiency
    path_map = {}
    print("Building asset map...")
    for root, dirs, files in os.walk(ASSETS_ROOT):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, os.path.join(ROOT, "witcher-compendium", "assets"))
            # Pre-store base names to find files in wrong folders
            name = f.lower()
            if name not in path_map:
                path_map[name] = []
            path_map[name].append(f"modules/witcher-compendium/assets/{rel_path.replace(os.sep, '/')}")

    print(f"Found {len(path_map)} unique filenames on disk.")
    
    healed_count = 0
    not_found_count = 0
    
    print(f"Processing {len(broken_entries)} broken references...")
    
    for entry in broken_entries:
        json_file = entry['json_file']
        orig_img = entry['img_path']
        
        if not os.path.exists(json_file):
            continue
            
        fname_no_ext = os.path.splitext(os.path.basename(orig_img))[0].lower()
        
        # Find in map
        found_path = None
        for asset_name in path_map:
            if os.path.splitext(asset_name)[0] == fname_no_ext:
                found_path = path_map[asset_name][0]
                break
        
        if found_path:
            # Pick the first match
            new_path = found_path
            if new_path != orig_img:
                try:
                    with open(json_file, 'r', encoding='utf-8-sig') as f:
                        data = json.load(f)
                    
                    data["img"] = new_path
                    
                    with open(json_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=4, ensure_ascii=False)
                    healed_count += 1
                    if healed_count % 100 == 0:
                        print(f"Healed {healed_count} items...")
                except Exception as e:
                    print(f"Error updating {json_file}: {e}")
        else:
            not_found_count += 1

    print(f"\nHealing Complete!")
    print(f"Healed: {healed_count} references updated.")
    print(f"Still missing: {not_found_count} images (not found on disk).")

if __name__ == "__main__":
    heal_all_images()
