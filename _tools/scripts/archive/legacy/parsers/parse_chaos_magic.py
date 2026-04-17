import json
import re
import os

def parse_chaos_magic(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Normalize newlines
    content = content.replace('\r\n', '\n')
    
    # Split the whole content by "Costo in RES:"
    # We find all occurrences and their positions
    matches = list(re.finditer(r'Costo in RES:\s*(\d+)', content))
    
    entries = []
    
    for i, match in enumerate(matches):
        cost = match.group(1)
        start_of_cost = match.start()
        end_of_cost = match.end()
        
        # The NAME is before "Costo in RES:"
        # We look back from start_of_cost to find the name.
        # It's usually the text after the previous entry's "Difese: ..." or after a header.
        
        # The EFFECT, RANGE, DURATION, DEFENSE are after the cost
        # We look forward until the next cost or end of file
        end_of_entry = matches[i+1].start() if i+1 < len(matches) else len(content)
        entry_text = content[end_of_cost:end_of_entry]
        
        # Look back for name
        prev_end = matches[i-1].end() if i > 0 else 0
        name_area = content[prev_end:start_of_cost]
        
        # Clean name area: remove everything before "Difese: ..." if it exists
        if "Difese:" in name_area:
            name_area = name_area.split("Difese:")[-1]
            # remove the value of the previous defense
            name_area = re.sub(r'^.*?\n', '', name_area) # jump first line if it's the defense value
            
        # The name is likely the last non-empty lines
        name_lines = [l.strip() for l in name_area.split('\n') if l.strip()]
        if not name_lines: continue
        name = name_lines[-1]
        
        # Clean name from page markers or headers
        name = re.sub(r'^[0-9\s/]+', '', name).strip()
        name = re.sub(r'--- Pagina \d+ ---', '', name).strip()
        if name.upper() in ["TERRA", "ARIA", "FUOCO", "ACQUA", "ELEMENTO MISTO", "INCANTESIMI DA NOVIZIO", "INCANTESIMI DA ESPERTO"]:
            if len(name_lines) > 1:
                name = name_lines[-2]
            else:
                continue

        # Extract fields from entry_text
        effect = ""
        range_val = ""
        duration = ""
        defense = ""
        
        m_eff = re.search(r'Effetto:\s*(.*?)\s+Portata:', entry_text, re.DOTALL)
        if m_eff: effect = m_eff.group(1).strip()
        
        m_port = re.search(r'Portata:\s*(.*?)\s+Durata:', entry_text, re.DOTALL)
        if m_port: range_val = m_port.group(1).strip()
        
        m_dur = re.search(r'Durata:\s*(.*?)\s+Difese:', entry_text, re.DOTALL)
        if m_dur: duration = m_dur.group(1).strip()
        
        m_def = re.search(r'Difese:\s*(.*)', entry_text, re.DOTALL)
        if m_def: defense = m_def.group(1).strip().split('\n')[0] # Only take first line of defense

        # Meta info based on position in file
        prefix = content[:start_of_cost]
        current_page = "0"
        page_matches = list(re.finditer(r'--- Pagina (\d+) ---', prefix))
        if page_matches: current_page = page_matches[-1].group(1)
        
        tier = "Novizio"
        if "INCANTESIMI DA ESPERTO" in prefix.upper(): tier = "Esperto"
        if "INCANTESIMI DA MAESTRO" in prefix.upper(): tier = "Maestro"
        
        subtype = "Misto"
        if "TERRA" in name_area.upper(): subtype = "Terra"
        if "ARIA" in name_area.upper(): subtype = "Aria"
        if "FUOCO" in name_area.upper(): subtype = "Fuoco"
        if "ACQUA" in name_area.upper(): subtype = "Acqua"

        category = "Mago"
        if "Prete" in file_path: category = "Prete"
        if "Druido" in file_path: category = "Druido"

        entries.append({
            "name": name,
            "cost": cost,
            "effect": effect.replace('\n', ' '),
            "range": range_val,
            "duration": duration,
            "defense": defense,
            "tier": tier,
            "subtype": subtype,
            "category": category,
            "page": current_page,
            "source": "Tomo del Caos"
        })
            
    return entries

# Process all magic files
magic_files = [
    "Pag083_Incantesimi da Mago.txt",
    "Pag093_Invocazioni da Prete.txt",
    "Pag098_Invocazioni da Druido.txt"
]

all_magic = []
base_dir = "e:/AntigravitiProgetti/CompendioTheWitcher/Tomo del Caos/Testi/"

for f in magic_files:
    path = os.path.join(base_dir, f)
    if os.path.exists(path):
        print(f"Parsing {f}...")
        all_magic.extend(parse_chaos_magic(path))

with open("e:/AntigravitiProgetti/CompendioTheWitcher/data/raw_chaos_magic.json", "w", encoding="utf-8") as out:
    json.dump(all_magic, out, indent=4, ensure_ascii=False)

print(f"Total magic entries extracted: {len(all_magic)}")
