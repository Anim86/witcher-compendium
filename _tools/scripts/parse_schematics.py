import re
import json
import os

def parse_schematics(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    schematics = []
    current_category = ""
    current_tier = ""
    
    # Entry fragments
    current_entry = {
        "name": "",
        "cd": 0,
        "time": "",
        "components": [],
        "investment": 0,
        "cost": 0
    }
    
    for line in lines:
        line = line.strip()
        if not line or "Nome CD" in line or "Alessandro Pacifico" in line or "---" in line:
            continue
            
        # Category/Tier detection
        if "SCHEMI DI" in line.upper():
            current_category = line
            continue
        if "Schemi da" in line:
            current_tier = line.replace("Schemi da", "").strip()
            continue
            
        # Look for Investment and Cost (two numbers at end of line)
        inv_cost_match = re.search(r'(\d+)\s+(\d+)$', line)
        
        # Look for Name, CD, Time: (Name) (Digits) (Digits ore/minuti)
        header_match = re.search(r'^(.+?)\s+(\d+)\s+(\d+\s+(?:ore|minuti|ora|ora))\b', line)
        
        # Look for components: (Name) (xN)
        comp_matches = re.findall(r'([^,()]+?)\s*\([x×]\d+\)', line)
        
        if header_match:
            # If we already have a name, this is a new entry, but wait, 
            # we need to decide when to save. 
            # Let's save when we have all fields or when a new header starts.
            if current_entry["name"]:
                schematics.append(current_entry.copy())
                current_entry = {"name": "", "cd": 0, "time": "", "components": [], "investment": 0, "cost": 0}
            
            current_entry["name"] = header_match.group(1).strip()
            current_entry["cd"] = int(header_match.group(2))
            current_entry["time"] = header_match.group(3).strip()
            current_entry["category"] = current_category
            current_entry["tier"] = current_tier

        if comp_matches:
            # Add to current components
            current_entry["components"].append(line)

        if inv_cost_match and not header_match:
            # Check if this is the end of an entry
            # In some cases, header and inv/cost are on the same line (captured by header_match logic above)
            current_entry["investment"] = int(inv_cost_match.group(1))
            current_entry["cost"] = int(inv_cost_match.group(2))
            
            # If we have name and cost, it's likely finished
            if current_entry["name"]:
                schematics.append(current_entry.copy())
                current_entry = {"name": "", "cd": 0, "time": "", "components": [], "investment": 0, "cost": 0}

    # Final entry
    if current_entry["name"]:
        schematics.append(current_entry)

    return schematics

if __name__ == "__main__":
    base_path = r"e:\AntigravitiProgetti\CompendioTheWitcher\Tomo Base\Testi"
    file_path = os.path.join(base_path, "Pag132_Schemi di Manifattura.txt")
    
    if os.path.exists(file_path):
        data = parse_schematics(file_path)
        
        output_dir = "data"
        if not os.path.exists(output_dir): os.makedirs(output_dir)
            
        with open(os.path.join(output_dir, "raw_crafting_schematics.json"), "w", encoding="utf-8") as out:
            json.dump(data, out, indent=4, ensure_ascii=False)
        print(f"Parsed {len(data)} crafting schematics.")
