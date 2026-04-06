import re
import json
import os

def parse_crafting_components(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by categories
    categories = re.split(r'\n([A-Z\s]{5,})\n', content)
    
    components = []
    
    # We skip first element (page header) and pair up category title with content
    for i in range(1, len(categories), 2):
        category_name = categories[i].strip()
        category_content = categories[i+1]
        
        # skip sections that are just descriptions
        if "COMPONENTI" in category_name and "MANIFATTURA" in category_name and len(category_name) > 30:
            continue
            
        lines = category_content.strip().split('\n')
        for line in lines:
            line = line.strip()
            if not line or "Nome Rarità" in line or "Alessandro Pacifico" in line or line.isdigit():
                continue
            
            # Pattern: Name | Rarity | Location | Quantity | DC | Weight | Cost
            # Rarity is C, D, S, R.
            # Quantity is often "X Unità" or "N/A" or "Variabile"
            # DC is digit or "N/A"
            # Weight is decimal
            # Cost is integer
            
            # Using a reversed lookahead/behind for the last two numeric fields (Weight and Cost)
            # or just splitting and analyzing from the end.
            
            parts = line.split()
            if len(parts) < 3: continue
            
            # Find the rarity (it's always a single uppercase letter C, D, S, R)
            rarity_idx = -1
            for idx, p in enumerate(parts):
                if p in ['C', 'D', 'S', 'R'] and idx > 0:
                    rarity_idx = idx
                    break
            
            if rarity_idx == -1: continue
            
            name = " ".join(parts[:rarity_idx])
            rarity = parts[rarity_idx]
            
            # The rest: Location, Quantity, DC, Weight, Cost
            rest = parts[rarity_idx+1:]
            
            # Heuristic: work from the end for cost and weight
            cost = rest[-1] if rest else "0"
            weight = rest[-2] if len(rest) > 1 else "0"
            
            # If weight or cost looking parts are not digits, handle them
            if not cost.isdigit(): 
                # Maybe cost is missing or it's a different format
                cost = "0"
            
            # Location and the rest
            location_info = " ".join(rest[:-2]) if len(rest) > 2 else " ".join(rest)
            
            components.append({
                "name": name,
                "category": category_name,
                "rarity": rarity,
                "location": location_info,
                "weight": weight.replace(',', '.'),
                "cost": int(cost)
            })
            
    return components

if __name__ == "__main__":
    base_path = r"e:\AntigravitiProgetti\CompendioTheWitcher\Tomo Base\Testi"
    file_path = os.path.join(base_path, "Pag130_Componenti per la Manifattura.txt")
    
    if os.path.exists(file_path):
        data = parse_crafting_components(file_path)
        
        output_dir = "data"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        with open(os.path.join(output_dir, "raw_crafting_components.json"), "w", encoding="utf-8") as out:
            json.dump(data, out, indent=4, ensure_ascii=False)
        print(f"Parsed {len(data)} crafting components.")
