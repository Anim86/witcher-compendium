import re
import json
import os

def parse_rituals(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    rituals = []
    # Split by ritual blocks. They start with a Title then "Costo in RES:"
    # Use a positive lookahead to find the next title or end of file
    ritual_blocks = re.split(r'\n(?=[A-Z\u00C0-\u017F][a-z\u00C0-\u017F]+(?:\s+[A-Z\u00C0-\u017F][a-z\u00C0-\u017F]+)*\s+Costo in RES:)', content)
    
    for block in ritual_blocks:
        if "Costo in RES:" not in block: continue
        
        # Pattern: (Name) Costo in RES: (Cost) Effetto: (Effect) [Stats] Componenti: (Comp)
        match = re.search(r'^([A-Z\u00C0-\u017F].*?)[\s\n]+Costo in RES:\s*(\d+).*?Effetto:\s*(.*?)\s*Tempo di Preparazione:\s*(.*?)\s*Difficoltà della Prova:\s*(.*?)\s*Durata:\s*(.*?)\s*Componenti:\s*(.*)', block, re.DOTALL)
        
        if match:
            rituals.append({
                "name": match.group(1).strip(),
                "type": "Ritual",
                "cost_res": int(match.group(2)),
                "effect": match.group(3).strip(),
                "prep_time": match.group(4).strip(),
                "difficulty": match.group(5).strip(),
                "duration": match.group(6).strip(),
                "components": match.group(7).strip()
            })
    return rituals

def parse_hexes(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    hexes = []
    # Split by titles which are followed by Costo in RES
    # Titles: La Fattura delle Ombre, Il Bacio della Pesta, Il Prurito Perenne, La Fortuna del Diavolo, La Fattura della Bestia, L’Incubo
    titles = ["La Fattura delle Ombre", "Il Bacio della Pesta", "Il Prurito Perenne", "La Fortuna del Diavolo", "La Fattura della Bestia", "L’Incubo"]
    
    for title in titles:
        # Search for title followed by fields
        pattern = re.escape(title) + r'\s+Costo in RES:\s*(\d+)\s+Effetto:\s*(.*?)\s+Pericolosità:\s*(.*?)\s+Occorrente per Toglierla:\s*(.*?)(?=\n[A-Z\u00C0-\u017F]|\nL’|\nIl|\nLa|Alessandro|---|$)'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            hexes.append({
                "name": title,
                "type": "Hex",
                "cost_res": int(match.group(1)),
                "effect": match.group(2).strip(),
                "danger": match.group(3).strip(),
                "removal": match.group(4).strip()
            })
    return hexes

if __name__ == "__main__":
    base_path = r"e:\AntigravitiProgetti\CompendioTheWitcher\Tomo Base\Testi"
    
    all_magic_misc = []
    
    ritual_file = os.path.join(base_path, "Pag118_Rituali.txt")
    if os.path.exists(ritual_file):
        rituals = parse_rituals(ritual_file)
        all_magic_misc.extend(rituals)
        print(f"Parsed {len(rituals)} rituals.")

    hex_file = os.path.join(base_path, "Pag122_Fatture.txt")
    if os.path.exists(hex_file):
        hexes = parse_hexes(hex_file)
        all_magic_misc.extend(hexes)
        print(f"Parsed {len(hexes)} hexes.")

    output_dir = "data"
    if not os.path.exists(output_dir): os.makedirs(output_dir)
        
    with open(os.path.join(output_dir, "raw_rituals_hexes.json"), "w", encoding="utf-8") as out:
        json.dump(all_magic_misc, out, indent=4, ensure_ascii=False)
