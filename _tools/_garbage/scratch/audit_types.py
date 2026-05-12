import os
import json

def audit_monster_types(root_dir):
    report = []
    valid_types = [
        "Humanoid", "Necrophage", "Specter", "Beast", 
        "CursedOne", "Hybrid", "Insectoid", "Elementa", 
        "Relict", "Ogroid", "Draconid", "Vampire"
    ]
    
    total_found = 0
    mapped = 0
    unmapped = []
    invalid = []
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.json'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                    # Only process actors of type 'monster'
                    if data.get('type') == 'monster':
                        total_found += 1
                        m_type = data.get('system', {}).get('details', {}).get('monsterType', None)
                        
                        if m_type is None or m_type == "":
                            unmapped.append({"name": data.get('name', file), "file": path})
                        elif m_type not in valid_types:
                            invalid.append({"name": data.get('name', file), "type": m_type, "file": path})
                        else:
                            mapped += 1
                except Exception as e:
                    print(f"Error reading {path}: {e}")
                    
    print(f"Found {total_found} monsters.")
    print(f"Mapped: {mapped} ({(mapped/total_found*100 if total_found > 0 else 0):.1f}%)")
    print(f"Unmapped: {len(unmapped)}")
    print(f"Invalid: {len(invalid)}")
    
    if unmapped:
        print("\nUNMAPPED MONSTERS:")
        for m in unmapped:
            print(f"- {m['name']} ({m['file']})")
            
    if invalid:
        print("\nINVALID MONSTER TYPES:")
        for m in invalid:
            print(f"- {m['name']}: {m['type']} ({m['file']})")

if __name__ == "__main__":
    audit_monster_types("_tools/src-packs")
