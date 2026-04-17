import re
import json
import os

def parse_alchemy(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Get names from descriptions on page 91
    # Descriptions format: Name Narrative...
    desc_section = content.split("DESCRIZIONE DEGLI OGGETTI ALCHEMICI")[1]
    item_names = []
    item_descs = {}
    
    # Heuristic for items in description: Starts at beginning of line, then a sentence.
    desc_lines = desc_section.split('\n')
    for line in desc_lines:
        line = line.strip()
        if not line or "Alessandro Pacifico" in line or "---" in line:
            continue
        # Name is usually 1-3 words
        match = re.search(r'^(.{3,30}?)\s+([A-Z\u00C0-\u017F].{10,})$', line)
        if match:
            name = match.group(1).strip()
            item_names.append(name)
            item_descs[name] = match.group(2).strip()

    alchemy_data = []
    
    # Now look for stats in the whole content
    # Stats pattern: (Name)? (Disp) (Effect text)? (Weight) (Cost)
    # Weight is d,d or d.d. Cost is d+.
    
    disp_values = ['D', 'C', 'S', 'R']
    
    for name in item_names:
        # Look for the name followed by stats, or stats followed by name
        # We search in the first part of the file (before descriptions)
        stats_search_area = content.split("DESCRIZIONE DEGLI OGGETTI ALCHEMICI")[0]
        
        # Try to find the line containing the name and Disp
        # Escaping name for regex
        name_esc = re.escape(name)
        
        # Pattern 1: Name [Disp] [Effect] [Weight] [Cost]
        # Weight can be integer OR float with ',' or '.'
        pattern = rf'{name_esc}.*?\b([DCSR])\b.*?(\d+[.,]?\d*)\s+(\d+)'
        match = re.search(pattern, stats_search_area, re.DOTALL | re.IGNORECASE)
        
        if match:
            disp = match.group(1)
            weight_str = match.group(2).replace(',', '.')
            cost_str = match.group(3)
            
            try:
                weight = float(weight_str)
                cost = int(cost_str)
                
                # The effect is usually the text between the name/disp and the weight/cost
                block = match.group(0)
                # Heuristic: effect is the part between Disp and Weight
                # We find the index of Disp and the index of Weight
                idx_disp = block.find(disp)
                idx_weight = block.rfind(match.group(2))
                effect_text = block[idx_disp+1:idx_weight].strip()
                
                alchemy_data.append({
                    "name": name,
                    "availability": disp,
                    "weight": weight,
                    "cost": cost,
                    "description": item_descs[name],
                    "mechanical_effect": effect_text
                })
            except ValueError:
                continue
            
    return alchemy_data

if __name__ == "__main__":
    base_path = r"e:\AntigravitiProgetti\CompendioTheWitcher\Tomo Base\Testi"
    file_path = os.path.join(base_path, "Pag089_Prodotti Alchemici.txt")
    
    if os.path.exists(file_path):
        data = parse_alchemy(file_path)
        
        output_dir = "data"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        with open(os.path.join(output_dir, "raw_alchemy_items.json"), "w", encoding="utf-8") as out:
            json.dump(data, out, indent=4, ensure_ascii=False)
        print(f"Parsed {len(data)} alchemy items.")
