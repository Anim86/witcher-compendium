import json
import os

SRC_ROOT = "witcher-compendium/src-packs"

def hotfix_schema():
    modified_count = 0
    total_count = 0

    # Types that use 'system.effect' instead of 'system.description'
    EFFECT_TYPES = ["spell", "ritual", "alchemical", "hex"]

    for root, dirs, files in os.walk(SRC_ROOT):
        for file in files:
            if not file.endswith('.json'): continue
            path = os.path.join(root, file)
            total_count += 1
            
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            doc_type = data.get("type")
            system = data.get("system", {})
            description = system.get("description", "")
            
            # 1. Actors (Monsters)
            if data.get("documentName") == "Actor" or doc_type == "monster":
                if description and description.strip():
                    # Move to system.notes
                    if "notes" not in system:
                        system["notes"] = []
                    
                    # Check if already migrated
                    already_migrated = any(n.get("title") == "Descrizione" for n in system["notes"])
                    if not already_migrated:
                        system["notes"].append({
                            "title": "Descrizione",
                            "details": description
                        })
                        # Optional: clear original description to avoid confusion
                        # system["description"] = ""
                        modified_count += 1

            # 2. Items (Spells, Alchemy, etc.)
            elif doc_type in EFFECT_TYPES:
                if description and description.strip():
                    # Move to system.effect
                    system["effect"] = description
                    # system["description"] = "" # Optional: system uses effect for UI
                    modified_count += 1

            # 3. Items (Weapons, Armor, etc.)
            else:
                # system.description is correct, but ensure it's not null
                if description is None:
                    system["description"] = ""
                    modified_count += 1

            # Save if modified
            data["system"] = system
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)

    print(f"Hotfixed schema for {modified_count} / {total_count} files.")

if __name__ == "__main__":
    hotfix_schema()
