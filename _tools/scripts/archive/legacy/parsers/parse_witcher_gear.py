import re
import json
import os

def parse_witcher_gear(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    gear_data = []
    
    # 1. Witcher Swords
    # Pattern: Name | Type | Acc | Danno | Mani | Aff | Effetti | Occ | Pot | Peso
    sword_matches = re.findall(r'(Spada d’\w+ da witcher)\s+([P/T])\s+([+-]?\d+)\s+([\d+d\d+]+)\s+(\d+)\s+(\d+)\s+(.*?)\s+(N/A)\s+(\d+)\s+([\d,.]+)', content)
    for m in sword_matches:
        gear_data.append({
            "name": m[0],
            "type": "Weapon",
            "subtype": "Witcher Sword",
            "damage": m[3],
            "reliability": int(m[5]),
            "effects": m[6].strip(),
            "weight": float(m[9].replace(',', '.')),
            "cost": 0 # Not specified in table, it's "più che raro"
        })

    # 2. Witcher Potions
    # Pattern: Name | Effect | Duration | Toxicity
    potion_section = content.split("POZIONI DA WITCHER")[1].split("UNGUENTI")[0]
    potion_matches = re.finditer(r'\n([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+([A-Z\u00C0-\u017F].*?)\s+(\d+\s+round|½ ora|N/A|2 ore)\s+(\d+%)', potion_section, re.DOTALL)
    for m in potion_matches:
        gear_data.append({
            "name": m.group(1).strip(),
            "type": "Potion",
            "subtype": "Witcher Potion",
            "effect": m.group(2).strip(),
            "duration": m.group(3).strip(),
            "toxicity": m.group(4).strip()
        })

    # 3. Witcher Oils (Unguents)
    oil_section = content.split("UNGUENTI")[1].split("DECOTTI")[0]
    oil_matches = re.findall(r'\n(Anti-[A-Z][a-z]+|Veleno dell’Impiccato)\s+([+-]\d+\s+danni.*)', oil_section)
    for m in oil_matches:
        gear_data.append({
            "name": m[0].strip(),
            "type": "Oil",
            "subtype": "Witcher Oil",
            "effect": m[1].strip(),
            "duration": "30 minuti"
        })

    # 4. Witcher Decoctions
    decoction_section = content.split("DECOTTI")[1].split("REALIZZARE")[0]
    # Decoctions can have multi-line effects
    decoction_matches = re.finditer(r'\n([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+([A-Z\u00C0-\u017F].*?)(?=\n[A-Z][a-z]|\n[A-Z]\s|$)', decoction_section, re.DOTALL)
    for m in decoction_matches:
        name = m.group(1).strip()
        if any(skip in name for skip in ["RODOLF", "I decotti", "Un decotto", "Decotto", "Effetti"]): continue
        gear_data.append({
            "name": name,
            "type": "Decoction",
            "subtype": "Witcher Decoction",
            "effect": m.group(2).strip(),
            "duration": "30 minuti",
            "toxicity": "75%"
        })

    return gear_data

if __name__ == "__main__":
    base_path = r"e:\AntigravitiProgetti\CompendioTheWitcher\Tomo Base\Testi"
    file_path = os.path.join(base_path, "Pag248_Equipaggiamento da Witcher.txt")
    
    if os.path.exists(file_path):
        data = parse_witcher_gear(file_path)
        
        output_dir = "data"
        if not os.path.exists(output_dir): os.makedirs(output_dir)
            
        with open(os.path.join(output_dir, "raw_witcher_gear.json"), "w", encoding="utf-8") as out:
            json.dump(data, out, indent=4, ensure_ascii=False)
        print(f"Parsed {len(data)} witcher gear items.")
