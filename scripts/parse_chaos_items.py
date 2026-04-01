import json
import re
import os

def parse_magic_items(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    entries = []
    # Pattern: NAME (ISTRUZIONE CD X) followed by description
    # We split by headers
    blocks = re.split(r'([A-Z\s’\']+\s*\(ISTRUZIONE CD \d+\))', content)
    
    # blocks[0] is intro
    for i in range(1, len(blocks), 2):
        header = blocks[i].strip()
        body = blocks[i+1].strip()
        
        name = re.sub(r'\(ISTRUZIONE CD \d+\)', '', header).strip()
        cd = re.search(r'CD (\d+)', header).group(1)
        
        # Clean body from footers
        body = re.sub(r'Davide Mesina - \d+', '', body)
        body = re.sub(r'--- Pagina \d+ ---', '', body)
        body = re.sub(r'\[Immagini.*?\]', '', body)
        
        entries.append({
            "name": name,
            "type": "Magic Item",
            "description": body.strip().replace('\n', ' '),
            "istruzione_cd": cd,
            "source": "Tomo del Caos"
        })
    return entries

def parse_elixirs(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    entries = []
    # Focused on the table in Pag 118
    # Format: Nome Disp. Effetto Tossicità Peso Costo
    # Using a simple line-based regex for the known elixirs
    names = ["Fulmine", "Mangusta", "Marciatore", "Steroidi Anabolizzanti", "Tempesta", "Ultima Speranza"]
    
    for name in names:
        pattern = re.compile(rf'{name}\s+R\s+(.*?)\s+(\d+%)\s+(\d+\.\d+)\s+(\d+)', re.DOTALL)
        match = pattern.search(content)
        if match:
            entries.append({
                "name": name,
                "type": "Elisir",
                "description": match.group(1).strip().replace('\n', ' '),
                "toxicity": match.group(2).strip(),
                "weight": match.group(3).strip(),
                "cost": match.group(4).strip(),
                "source": "Tomo del Caos"
            })
    return entries

def parse_trophies(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    entries = []
    # Table format: Name [Description]
    # We look for lines after "Trofeo Effetto"
    lines = content.split('\n')
    start_parsing = False
    current_cat = ""
    
    for line in lines:
        line = line.strip()
        if not line or "Davide Mesina" in line or "--- Pagina" in line: continue
        if "Trofeo Effetto" in line: 
            start_parsing = True
            continue
        if not start_parsing: continue
        
        # Categories are usually single or two words
        if line in ["Creature Maledette", "Dragonidi", "Elementali", "Ibridi", "Insettoidi", "Necrofagi", "Creature Ancestrali", "Spettri", "Vampiri", "Orchi", "Bestie"]:
            current_cat = line
            continue
            
        # Match "Name Description"
        # Names are usually single words in this table
        parts = line.split(' ', 1)
        if len(parts) == 2:
            entries.append({
                "name": f"Trofeo: {parts[0]}",
                "type": "Trophy",
                "category": current_cat,
                "description": parts[1].strip(),
                "source": "Tomo del Caos"
            })
            
    return entries

base_dir = "e:/AntigravitiProgetti/CompendioTheWitcher/Tomo del Caos/Testi/"
all_items = []

all_items.extend(parse_magic_items(os.path.join(base_dir, "Pag119_Oggetti Magici.txt")))
all_items.extend(parse_elixirs(os.path.join(base_dir, "Pag117_Elisir.txt")))
all_items.extend(parse_trophies(os.path.join(base_dir, "Pag126_Trofei.txt")))

# Add Glyphs from Pag112 if possible (simplified for now)
all_items.append({"name": "Glifi e Incantamenti", "type": "Reference", "description": "Consultare Pag 112-113 per la lista completa di Glifi e Incantamenti.", "source": "Tomo del Caos"})

with open("e:/AntigravitiProgetti/CompendioTheWitcher/data/raw_chaos_items.json", "w", encoding="utf-8") as out:
    json.dump(all_items, out, indent=4, ensure_ascii=False)

print(f"Total items extracted: {len(all_items)}")
