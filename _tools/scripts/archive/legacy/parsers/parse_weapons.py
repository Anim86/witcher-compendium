import re
import json
import os

def parse_weapons(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by pages to track images and page numbers
    pages_raw = re.split(r'--- Pagina (\d+) ---', content)
    
    weapon_data = []
    descriptions = {}
    page_to_images = {}
    
    # Process pages to map images
    for i in range(1, len(pages_raw), 2):
        page_num = pages_raw[i]
        page_content = pages_raw[i+1]
        img_match = re.search(r'\[Immagini presenti in questa pagina: (.*?)\]', page_content)
        if img_match:
            imgs = [img.strip() for img in img_match.group(1).split(',')]
            page_to_images[page_num] = imgs

    # Patterns for table detection
    # We look for lines that have a specific structure: [Name] [Type] [PA] [Disp] [DAN] [Aff] [Mani] [GIT] ... [Cost]
    # Type is usually one of: T, P, C, E, T/P, P/C, T/P/C
    type_pattern = r'\b(T|P|C|E|T/P|P/C|T/P/C|T/C)\b'
    
    for i in range(1, len(pages_raw), 2):
        page_num = pages_raw[i]
        page_content = pages_raw[i+1]
        lines = page_content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or "Nome Tipo PA" in line or "MUNIZIONI" in line:
                continue
                
            # Try to identify a weapon row
            # Format: Nome Tipo PA Disp DAN Aff Mani GIT Effetto Occ POT Peso Costo
            # Example: Spada di Ferro T/P 0 D 2d6+2 10 2 N/A G 0 1,5 160
            parts = line.split()
            if len(parts) < 10:
                continue
                
            # Find the index of the 'Type' column
            type_idx = -1
            for j, part in enumerate(parts):
                if re.fullmatch(type_pattern, part):
                    type_idx = j
                    break
            
            if type_idx == -1 or type_idx == 0:
                continue # Not a weapon row or name is missing
                
            try:
                name = " ".join(parts[:type_idx])
                # Check if next parts are numeric to confirm it's a table row
                pa = parts[type_idx+1]
                disp = parts[type_idx+2]
                dan = parts[type_idx+3]
                aff = parts[type_idx+4]
                mani = parts[type_idx+5]
                git = parts[type_idx+6]
                
                # Check if it's a throwing weapon (FIS range)
                if git == "FIS" and parts[type_idx+7].startswith("×"):
                    git = "FIS " + parts[type_idx+7]
                    eff_start_offset = 8
                else:
                    eff_start_offset = 7
                
                # The last 4 columns are: Occ, POT, Peso, Costo
                # But Effetto can be empty (N/A) or multiple words
                cost = parts[-1]
                peso = parts[-2]
                pot = parts[-3]
                occ = parts[-4]
                
                # Everything between GIT/Range-end and Occ is Effetto
                effetto = " ".join(parts[type_idx+eff_start_offset:-4])
                
                # Validate numeric fields to avoid false positives
                if not (pa.lstrip('-').isdigit() and aff.isdigit() and cost.isdigit()):
                    continue
                    
                weapon = {
                    "name": name,
                    "type": parts[type_idx],
                    "pa": int(pa),
                    "availability": disp,
                    "damage": dan,
                    "reliability": int(aff),
                    "hands": int(mani),
                    "range": git,
                    "effects": effetto if effetto else "N/A",
                    "concealment": occ,
                    "enhancements": int(pot) if pot.isdigit() else 0,
                    "weight": float(peso.replace(',', '.')),
                    "cost": int(cost),
                    "description": "",
                    "page": page_num,
                    "images": page_to_images.get(page_num, [])
                }
                weapon_data.append(weapon)
            except (ValueError, IndexError):
                continue

        # Look for descriptions in the same page
        # Descriptions usually start with Name followed by text
        # We'll use a list of weapon names already found
        for weapon in weapon_data:
            name = weapon["name"]
            # Look for lines starting with weapon name followed by description
            # Improved regex to handle "Bastone" vs "Bastone di Ferro"
            # We look for: ^Name [Description...] where description is not just table data
            pattern = re.compile(rf'^{re.escape(name)}\s+([A-Z\u00C0-\u017F].*)$', re.MULTILINE)
            desc_match = pattern.search(page_content)
            if desc_match:
                desc = desc_match.group(1).strip()
                # Safeguard: if the match is actually a table row, skip it
                if len(desc.split()) > 5 and not re.search(type_pattern, desc[:20]):
                    descriptions[name] = desc

    # Final association
    for weapon in weapon_data:
        if weapon["name"] in descriptions:
            weapon["description"] = descriptions[weapon["name"]]
            
    return weapon_data

if __name__ == "__main__":
    base_path = r"e:\AntigravitiProgetti\CompendioTheWitcher\Tomo Base\Testi"
    weapons_file = os.path.join(base_path, "Pag074_Armi.txt")
    
    if os.path.exists(weapons_file):
        data = parse_weapons(weapons_file)
        
        output_dir = "data"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        with open(os.path.join(output_dir, "raw_weapons.json"), "w", encoding="utf-8") as out:
            json.dump(data, out, indent=4, ensure_ascii=False)
        print(f"Parsed {len(data)} weapons.")
    else:
        print("File not found.")
