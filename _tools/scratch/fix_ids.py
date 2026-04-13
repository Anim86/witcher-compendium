import os
import json
import random
import string
import re

base_path = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO"

def generate_id():
    # Foundry IDs are 16 alphanumeric characters
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choice(chars) for _ in range(16))

def fix_files():
    fixed_count = 0
    renamed_count = 0
    
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if not file.endswith(".json"):
                continue
                
            file_path = os.path.join(root, file)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Skip empty files or non-json (basic check)
                    if len(content.strip()) < 2:
                        continue
                    data = json.loads(content)
                
                modified = False
                file_id = data.get("_id")
                
                # 1. Ensure internal _id exists
                if not file_id:
                    file_id = generate_id()
                    data["_id"] = file_id
                    # Put _id as the first key if possible for aesthetic reasons
                    new_data = {"_id": file_id}
                    new_data.update({k: v for k, v in data.items() if k != "_id"})
                    data = new_data
                    modified = True
                    print(f"Generated ID {file_id} for {file}")
                
                if modified:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=4, ensure_ascii=False)
                    fixed_count += 1
                
                # 2. Ensure filename contains ID
                # Convention: Name_id.json
                # Check if the filename ends with _[id].json
                # We use a regex to see if it already has a 16-char ID suffix
                has_id_suffix = re.search(r"_[a-z0-9]{16}\.json$", file)
                
                if not has_id_suffix:
                    name_part = os.path.splitext(file)[0]
                    new_filename = f"{name_part}_{file_id}.json"
                    new_path = os.path.join(root, new_filename)
                    
                    # Avoid collision (rare but safe)
                    if os.path.exists(new_path):
                        print(f"Warning: {new_filename} already exists, skipping rename.")
                    else:
                        os.rename(file_path, new_path)
                        print(f"Renamed {file} -> {new_filename}")
                        renamed_count += 1
                        
            except Exception as e:
                print(f"Error processing {file}: {e}")

    print(f"\nSummary:")
    print(f"Files with added ID: {fixed_count}")
    print(f"Files renamed to include ID: {renamed_count}")

if __name__ == "__main__":
    fix_files()
