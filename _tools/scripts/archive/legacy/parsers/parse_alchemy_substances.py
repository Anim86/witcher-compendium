import re
import json
import os

def parse_alchemy_substances(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Elements are the category headers
    elements = [
        "CAELUM", "ETERE", "FULGUR", "HYDRAGENUM", 
        "QUEBRITH", "REBIS", "SOL", "VERMIGLIO", "VETRIOLO"
    ]
    
    # Split content by these elements
    pattern = r'\n(' + '|'.join(elements) + r')\b'
    sections = re.split(pattern, content)
    
    substances = []
    
    # Skip first part, then pair Element name and Content
    for i in range(1, len(sections), 2):
        element_name = sections[i].strip().title()
        category_content = sections[i+1]
        
        lines = category_content.strip().split('\n')
        for line in lines:
            line = line.strip()
            if not line or "Nome Rarità" in line or "Alessandro Pacifico" in line or line.isdigit():
                continue
            
            # Anchor on rarity C, D, S, R
            parts = line.split()
            if len(parts) < 3: continue
            
            rarity_idx = -1
            for idx, p in enumerate(parts):
                if p in ['C', 'D', 'S', 'R'] and idx > 0:
                    rarity_idx = idx
                    break
            
            if rarity_idx == -1: continue
            
            name = " ".join(parts[:rarity_idx])
            rarity = parts[rarity_idx]
            rest = parts[rarity_idx+1:]
            
            # Cost and Weight from the end
            # Some entries might have missing weight or CD
            cost = rest[-1] if rest and rest[-1].isdigit() else "0"
            weight = rest[-2] if len(rest) > 1 and re.match(r'\d+[.,]?\d*', rest[-2]) else "0.1"
            
            location_info = " ".join(rest[:-2]) if len(rest) > 2 else " ".join(rest)
            
            substances.append({
                "name": name,
                "element": element_name,
                "rarity": rarity,
                "location": location_info,
                "weight": weight.replace(',', '.'),
                "cost": int(cost)
            })
            
    return substances

if __name__ == "__main__":
    base_path = r"e:\AntigravitiProgetti\CompendioTheWitcher\Tomo Base\Testi"
    file_path = os.path.join(base_path, "Pag145_Sostanze Alchemiche.txt")
    
    if os.path.exists(file_path):
        data = parse_alchemy_substances(file_path)
        
        output_dir = "data"
        if not os.path.exists(output_dir): os.makedirs(output_dir)
            
        with open(os.path.join(output_dir, "raw_alchemy_substances.json"), "w", encoding="utf-8") as out:
            json.dump(data, out, indent=4, ensure_ascii=False)
        print(f"Parsed {len(data)} alchemy substances.")
