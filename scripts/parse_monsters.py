import re
import json
import os
import glob

def parse_monster_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    monster = {}
    
    # 1. Name
    name_match = re.search(r'--- Pagina \d+ ---\n.*?\n\d+\s+(.*)', content)
    if name_match:
        monster["name"] = name_match.group(1).strip()
    else:
        # Fallback to filename
        monster["name"] = os.path.basename(file_path).split('_')[1].replace('.txt', '')

    # 2. Stats Block (INT, RIF, etc.)
    stats = {}
    stat_names = ["INT", "RIF", "DES", "FIS", "VEL", "EMP", "MAN", "VOL", "FOR", "GRI", "COR", "BAL", "RES", "ING", "REC", "PS", "VIGORE"]
    for sn in stat_names:
        s_match = re.search(rf'{sn}\s+(\d+)', content)
        if s_match:
            stats[sn] = int(s_match.group(1))
    monster["stats"] = stats

    # 3. Skills (Abilità)
    skills = {}
    skill_matches = re.finditer(r'\n([A-Z\u00C0-\u017F][a-z\u00C0-\u017F]+(?:\s+[a-z\u00C0-\u017F]+)*)\s+([+-]\d+)', content)
    for sm in skill_matches:
        skills[sm.group(1).strip()] = sm.group(2).strip()
    monster["skills"] = skills

    # 4. Vulnerabilità
    vuln_section = re.search(r'Vulnerabilità\n(.*?)(?=\nCapacità|\nABILITÀ|\nBottino)', content, re.DOTALL)
    if vuln_section:
        monster["vulnerabilities"] = [v.strip() for v in vuln_section.group(1).strip().split('\n') if v.strip()]

    # 5. Capacità
    # This is trickier as it has name + description.
    # Usually: Name Description...
    cap_section = re.search(r'Capacità\n(.*?)(?=\nABILITÀ|\nBottino|\nArmi)', content, re.DOTALL)
    if cap_section:
        # Heuristic: Capacity name is 1-2 words starting at line begin
        caps = []
        lines = cap_section.group(1).strip().split('\n')
        current_cap = None
        for line in lines:
            if re.match(r'^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$', line.strip()):
                if current_cap: caps.append(current_cap)
                current_cap = {"name": line.strip(), "description": ""}
            elif current_cap:
                current_cap["description"] += " " + line.strip()
        if current_cap: caps.append(current_cap)
        monster["capacities"] = caps

    # 6. Bottino
    loot_section = re.search(r'Bottino\n(.*?)(?=\nArmi|\nAlessandro|\n---)', content, re.DOTALL)
    if loot_section:
        monster["loot"] = [l.strip() for l in loot_section.group(1).strip().split('\n') if l.strip()]

    # 7. Armi
    # Table: Nome DAN Effetti N°Att
    weapons = []
    weapon_section = re.search(r'Armi\nNome DAN Effetti N°Att\n(.*?)(?=\nAlessandro|\n---|$)', content, re.DOTALL)
    if weapon_section:
        w_lines = weapon_section.group(1).strip().split('\n')
        for wl in w_lines:
            # Pattern: (Name) (Damage) (Effects) (Num)
            wm = re.search(r'^(.*?)\s+(\d+d\d+[\d+-]*)\s+(.*?)\s+(\d+)$', wl.strip())
            if wm:
                weapons.append({
                    "name": wm.group(1).strip(),
                    "damage": wm.group(2).strip(),
                    "effects": wm.group(3).strip(),
                    "count": int(wm.group(4))
                })
    monster["weapons"] = weapons

    # 8. General Info
    info = {}
    for label in ["Altezza", "Peso", "Ambiente", "Intelligenza", "Organizzazione"]:
        im = re.search(rf'{label}\s+(.*)', content)
        if im:
            info[label] = im.group(1).strip()
    monster["general_info"] = info

    # 9. Threat Level and Reward
    threat_match = re.search(r'Minaccia\n(.*?)\s+(.*?)\nRicompensa\n(\d+)', content)
    if threat_match:
        monster["threat"] = f"{threat_match.group(1)} {threat_match.group(2)}".strip()
        monster["reward"] = int(threat_match.group(3))

    return monster

def main():
    base_path = r"e:\AntigravitiProgetti\CompendioTheWitcher\Tomo Base\Testi"
    # List of pages that are monsters based on file list
    # Drowner (279), Ghoul (281), Streghe (283), Wraith (285), Wraith Diurni (287), 
    # Lupi (289), Lupi Mannari (291), Sirene (293), Grifoni (295), Endriaghe (297), 
    # Arachas (299), Golem (301), Demoni (303), Nekker (305), Troll (307), Viverne (309), Katakan (311)
    
    monster_files = glob.glob(os.path.join(base_path, "Pag2[789]*_*.txt")) + \
                    glob.glob(os.path.join(base_path, "Pag30*_*.txt")) + \
                    glob.glob(os.path.join(base_path, "Pag311_*.txt"))
    
    all_monsters = []
    for f in monster_files:
        # Check if it's really a monster file (skip Table of contents or intro)
        if "Bestiario" in f or "Tipologie" in f: continue
        print(f"Parsing {os.path.basename(f)}...")
        try:
            m = parse_monster_file(f)
            if m: all_monsters.append(m)
        except Exception as e:
            print(f"Error parsing {f}: {e}")

    output_dir = "data"
    if not os.path.exists(output_dir): os.makedirs(output_dir)
        
    with open(os.path.join(output_dir, "raw_monsters.json"), "w", encoding="utf-8") as out:
        json.dump(all_monsters, out, indent=4, ensure_ascii=False)
    print(f"Total monsters parsed: {len(all_monsters)}")

if __name__ == "__main__":
    main()
