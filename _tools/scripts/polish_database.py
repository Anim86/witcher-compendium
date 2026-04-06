import json
import os
import re

# Paths
SRC_ROOT = "../src-packs"

SPELL_ELEMENTS = {
    "igni": "Fire",
    "aard": "Air",
    "quen": "Earth",
    "yrden": "Mixed",
    "axii": "Water",
    "fuoco": "Fire",
    "aria": "Air",
    "terra": "Earth",
    "acqua": "Water",
    "misto": "Mixed"
}

def restore_spell_element(name, system):
    name_lower = name.lower()
    
    # 1. Check signs directly
    for key, element in SPELL_ELEMENTS.items():
        if key in name_lower:
            return element
            
    # 2. Check for Divine/Invocations
    if "preghiera" in name_lower or "invocazione" in name_lower:
        return "Divine"
        
    # 3. Default to current system.source if it's NOT a book ref
    current_source = system.get("source", "")
    if current_source and not re.match(r'(MB|TC)\s+\d+', current_source):
        return current_source
        
    return "" # Undefined or not applicable

def main():
    modified_count = 0
    total_count = 0
    
    for root, dirs, files in os.walk(SRC_ROOT):
        for file in files:
            if not file.endswith('.json'): continue
            path = os.path.join(root, file)
            total_count += 1
            
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            name = data.get("name", "")
            doc_type = data.get("type", "")
            system = data.get("system", {})
            changed = False

            # 1. Polish SourceBook (Reference)
            # Ensure system.sourcebook exists and move it from system.source if it was mis-assigned
            current_sb = system.get("sourcebook", "")
            current_s = system.get("source", "")
            
            if not current_sb and current_s and re.match(r'(MB|TC)\s+\d+', current_s):
                system["sourcebook"] = current_s
                changed = True
            
            # 2. Restore Spell Elements
            if doc_type == "spell":
                restored_element = restore_spell_element(name, system)
                if restored_element and system.get("source") != restored_element:
                    system["source"] = restored_element
                    changed = True
                # Ensure the book ref is in the correct place, not 'source'
                if current_s and re.match(r'(MB|TC)\s+\d+', current_s):
                    system["source"] = restored_element
                    changed = True

            if changed:
                data["system"] = system
                with open(path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                modified_count += 1

    print(f"Database Polish (v1.0.0 - Release Prep):")
    print(f"Entries Refined/Fixed: {modified_count}")
    print(f"Total Entries: {total_count}")

if __name__ == "__main__":
    main()

