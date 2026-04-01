import json
import re
import os

def parse_chaos_rituals(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Anchor: Costo in RES:
    matches = list(re.finditer(r'Costo in RES:\s*(\d+|Variabile)', content))
    entries = []
    
    for i, match in enumerate(matches):
        cost = match.group(1)
        start_of_cost = match.start()
        end_of_cost = match.end()
        
        end_of_entry = matches[i+1].start() if i+1 < len(matches) else len(content)
        entry_text = content[end_of_cost:end_of_entry]
        
        # Name lookup
        prev_end = matches[i-1].end() if i > 0 else 0
        name_area = content[prev_end:start_of_cost]
        name_lines = [l.strip() for l in name_area.split('\n') if l.strip()]
        if not name_lines: continue
        name = name_lines[-1]
        name = re.sub(r'^[0-9\s/]+', '', name).strip()
        name = re.sub(r'--- Pagina \d+ ---', '', name).strip()
        
        if name.upper() in ["RITUALI DA NOVIZIO", "RITUALI DA ESPERTO", "RITUALI DA MAESTRO", "FATTURE"]:
            if len(name_lines) > 1: name = name_lines[-2]
            else: continue

        # extraction
        effect = ""
        prep = ""
        diff = ""
        duration = ""
        components = ""
        
        m_eff = re.search(r'Effetto:\s*(.*?)\s+Tempo di Preparazione:', entry_text, re.DOTALL)
        if m_eff: effect = m_eff.group(1).strip().replace('\n', ' ')
        
        m_prep = re.search(r'Tempo di Preparazione:\s*(.*?)\s+Difficoltà della Prova:', entry_text, re.DOTALL)
        if m_prep: prep = m_prep.group(1).strip()
        
        m_diff = re.search(r'Difficoltà della Prova:\s*(.*?)\s+Durata:', entry_text, re.DOTALL)
        if m_diff: diff = m_diff.group(1).strip()
        
        m_dur = re.search(r'Durata:\s*(.*?)\s+Componenti:', entry_text, re.DOTALL)
        if m_dur: duration = m_dur.group(1).strip()
        
        m_comp = re.search(r'Componenti:\s*(.*)', entry_text, re.DOTALL)
        if m_comp: components = m_comp.group(1).strip().split('\n')[0]

        type_label = "Ritual" if "Rituali" in file_path else "Hex"
        
        prefix = content[:start_of_cost]
        tier = "Novizio"
        if "ESPERTO" in prefix.upper(): tier = "Esperto"
        if "MAESTRO" in prefix.upper(): tier = "Maestro"

        entries.append({
            "name": name,
            "cost": cost,
            "effect": effect,
            "prep_time": prep,
            "difficulty": diff,
            "duration": duration,
            "components": components,
            "tier": tier,
            "type": type_label,
            "source": "Tomo del Caos"
        })
    return entries

base_dir = "e:/AntigravitiProgetti/CompendioTheWitcher/Tomo del Caos/Testi/"
all_rituals = []

all_rituals.extend(parse_chaos_rituals(os.path.join(base_dir, "Pag104_Rituali.txt")))
# Note: I should check Fatture as well if the structure is the same
path_fatture = os.path.join(base_dir, "Pag107_Fatture.txt")
if os.path.exists(path_fatture):
    print("Parsing Fatture...")
    all_rituals.extend(parse_chaos_rituals(path_fatture))

with open("e:/AntigravitiProgetti/CompendioTheWitcher/data/raw_chaos_rituals.json", "w", encoding="utf-8") as out:
    json.dump(all_rituals, out, indent=4, ensure_ascii=False)

print(f"Total rituals/hexes extracted: {len(all_rituals)}")
