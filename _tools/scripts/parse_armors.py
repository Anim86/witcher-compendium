import re
import json
import os

def parse_armors(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    pages_raw = re.split(r'--- Pagina (\d+) ---', content)
    
    armor_data = []
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

    # Armor types / headers
    # Common Disp patterns
    disp_values = ['D', 'C', 'S', 'R']
    
    current_category = ""
    
    for i in range(1, len(pages_raw), 2):
        page_num = pages_raw[i]
        page_content = pages_raw[i+1]
        lines = page_content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or "Nome Pr Disp." in line or "Nome Aff. Disp." in line:
                if "TESTA" in line: current_category = "Head"
                elif "TORSO" in line: current_category = "Torso"
                elif "GAMBE" in line: current_category = "Legs"
                elif "SCUDI" in line: current_category = "Shield"
                continue
            
            if line.isupper() and len(line) >= 5:
                if "TESTA" in line: current_category = "Head"
                elif "TORSO" in line: current_category = "Torso"
                elif "GAMBE" in line: current_category = "Legs"
                elif "SCUDI" in line: current_category = "Shield"
                continue

            parts = line.split()
            if len(parts) < 6:
                continue

            # Check if it's a row by looking for availability and numeric values at end
            # Standard Armor: Nome Pr Disp. POA Effetto VI Peso Costo (8 cols total, but Effetto can be many)
            # Shield: Nome Aff. Disp. Effetto VI Peso Costo (7 cols total)
            
            idx_disp = -1
            for j, p in enumerate(parts):
                if p in disp_values and 0 < j < len(parts) - 3:
                    idx_disp = j
                    break
            
            if idx_disp == -1:
                continue
                
            try:
                name = " ".join(parts[:idx_disp-1])
                val_main = parts[idx_disp-1] # Pr or Aff
                disp = parts[idx_disp]
                
                # Numeric checks to confirm row
                cost = parts[-1]
                peso = parts[-2]
                vi = parts[-3]
                
                if not (cost.isdigit() and val_main.isdigit()):
                    continue
                
                if current_category == "Shield":
                    # Nome Aff. Disp. Effetto VI Peso Costo
                    effetto = " ".join(parts[idx_disp+1:-3])
                    poa = "0"
                else:
                    # Nome Pr Disp. POA Effetto VI Peso Costo
                    poa = parts[idx_disp+1]
                    effetto = " ".join(parts[idx_disp+2:-3])
                    if not poa.isdigit():
                         # Maybe Effetto is empty and POA is merged? No, POA should be digit
                         continue

                armor = {
                    "name": name,
                    "category": current_category,
                    "protection": int(val_main) if current_category != "Shield" else 0,
                    "reliability": int(val_main) if current_category == "Shield" else 0,
                    "availability": disp,
                    "poa": int(poa),
                    "effect": effetto if effetto else "N/A",
                    "encumbrance": int(vi),
                    "weight": float(peso.replace(',', '.')),
                    "cost": int(cost),
                    "description": "",
                    "page": page_num,
                    "images": page_to_images.get(page_num, [])
                }
                armor_data.append(armor)
            except (ValueError, IndexError):
                continue

        # Look for descriptions
        for armor in armor_data:
            name = armor["name"]
            pattern = re.compile(rf'^{re.escape(name)}\s+([A-Z\u00C0-\u017F].*)$', re.MULTILINE)
            desc_match = pattern.search(page_content)
            if desc_match:
                desc = desc_match.group(1).strip()
                if len(desc.split()) > 10:
                    descriptions[name] = desc

    for armor in armor_data:
        if armor["name"] in descriptions:
            armor["description"] = descriptions[armor["name"]]
            
    return armor_data

if __name__ == "__main__":
    base_path = r"e:\AntigravitiProgetti\CompendioTheWitcher\Tomo Base\Testi"
    armors_file = os.path.join(base_path, "Pag080_Armature.txt")
    
    if os.path.exists(armors_file):
        data = parse_armors(armors_file)
        
        output_dir = "data"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        with open(os.path.join(output_dir, "raw_armors.json"), "w", encoding="utf-8") as out:
            json.dump(data, out, indent=4, ensure_ascii=False)
        print(f"Parsed {len(data)} armors.")
    else:
        print("File not found.")
