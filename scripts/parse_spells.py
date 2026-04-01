import re
import json
import os

def parse_magic(file_path, magic_type):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    spell_data = []
    
    # State for Tier and Subtype (Element or Deity)
    current_tier = ""
    current_subtype = ""
    
    # Split by "Costo in RES:"
    parts = re.split(r'(Costo in RES:)', content)
    
    for i in range(1, len(parts), 2):
        pre_content = parts[i-1]
        post_content = parts[i+1]
        
        # Extract Tier
        tier_match = re.findall(r'(?:INVOCAZIONI DA|INCANTESIMI DA|SEGNI DA|SEGNI)\s+(?:NOVIZIO|ESPERTO|MAESTRO|DRUIDO|PREDICATORE|ARCIPRETE|WITCHER)', pre_content.upper())
        if tier_match:
            # Clean up the tier string
            tier_raw = tier_match[-1].lower()
            if "novizio" in tier_raw: current_tier = "Novizio"
            elif "esperto" in tier_raw: current_tier = "Esperto"
            elif "maestro" in tier_raw: current_tier = "Maestro"
            elif "druido" in tier_raw: current_tier = "Druido"
            elif "predicatore" in tier_raw: current_tier = "Predicatore"
            elif "arciprete" in tier_raw: current_tier = "Arciprete"

        # Extract Subtype (Element for Mago, Deity for Prete)
        # For Mago: TERRA, ARIA, etc.
        # For Prete: INVOCAZIONI DA DRUIDO, etc.
        subtype_match = re.findall(r'\b(TERRA|ARIA|FUOCO|ACQUA|ELEMENTO MISTO)\b', pre_content.upper())
        if subtype_match:
            current_subtype = subtype_match[-1].title()
        
        # Name is the last item in a line-by-line split (ignoring stamps)
        lines = pre_content.strip().split('\n')
        name = ""
        for line in reversed(lines):
            line = line.strip()
            # Skip page headers, stamps, and metadata
            if not line or "---" in line or "Alessandro Pacifico" in line or line.isdigit():
                continue
            # If line is exactly a tier or category, skip
            if any(cat in line.upper() for cat in ["INVOCAZIONI", "INCANTESIMI", "SEGNI", "NOVIZIO", "ESPERTO", "MAESTRO"]):
                continue
            name = line
            break
        
        if not name: continue

        # Extract fields
        res_match = re.search(r'^\s*(\d+|Variabile)', post_content)
        res = res_match.group(1) if res_match else "0"
        
        effetto = re.search(r'Effetto:(.*?)Portata:', post_content, re.DOTALL)
        portata = re.search(r'Portata:(.*?)Durata:', post_content, re.DOTALL)
        durata = re.search(r'Durata:(.*?)Difese?:', post_content, re.DOTALL)
        difesa = re.search(r'Difese?:(.*?)(?=\n[A-Z]|\r\n[A-Z]|$)', post_content, re.DOTALL)
        
        spell_data.append({
            "name": name,
            "type": magic_type,
            "tier": current_tier,
            "subtype": current_subtype,
            "res": res,
            "effect": effetto.group(1).strip() if effetto else "",
            "range": portata.group(1).strip() if portata else "",
            "duration": durata.group(1).strip() if durata else "",
            "defense": difesa.group(1).strip() if difesa else ""
        })

    return spell_data

if __name__ == "__main__":
    base_path = r"e:\AntigravitiProgetti\CompendioTheWitcher\Tomo Base\Testi"
    
    files_to_parse = [
        ("Pag103_Incantesimi da Mago.txt", "Incantesimo"),
        ("Pag111_Invocazioni da Prete.txt", "Invocazione"),
        ("Pag116_Segni da Witcher.txt", "Segno")
    ]
    
    all_magic = []
    output_dir = "data"
    if not os.path.exists(output_dir): os.makedirs(output_dir)

    for file_name, mtype in files_to_parse:
        file_path = os.path.join(base_path, file_name)
        if os.path.exists(file_path):
            data = parse_magic(file_path, mtype)
            all_magic.extend(data)
            print(f"Parsed {len(data)} from {file_name}")

    with open(os.path.join(output_dir, "raw_magic.json"), "w", encoding="utf-8") as out:
        json.dump(all_magic, out, indent=4, ensure_ascii=False)
