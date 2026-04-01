import json
import re
import os

def parse_chaos_monster(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Monster Name is the first capitalized line usually, but in files it's buried.
    # We look for the main title (all caps line)
    name_match = re.search(r'\n([A-Z\s]+)\n', content)
    name = name_match.group(1).strip() if name_match else os.path.basename(file_path).replace('.txt', '').replace('Pag', '').split('_')[-1]

    # Stats mapping
    stats = {}
    for stat in ["INT", "RIF", "DES", "DES", "FIS", "VEL", "EMP", "MAN", "VOL", "GRI", "COR", "BAL", "RES", "ING", "REC", "PS"]:
        m = re.search(rf'{stat}\s+(\d+)', content)
        if m: stats[stat] = m.group(1)

    # Derived/Meta
    meta = {}
    for key in ["Armatura", "Rigenerazione", "Schema", "Altezza", "Peso", "Ambiente", "Organizzazione", "Ricompensa"]:
        m = re.search(rf'{key}\s+(.*)', content)
        if m: meta[key] = m.group(1).strip().split('\n')[0]

    # Skills (Abilità)
    skills = {}
    # Find the ABILITÀ section and extract until first attribute (INT 1)
    skill_section = re.search(r'ABILITÀ\s+(.*?)\s+INT\s+\d+', content, re.DOTALL)
    if skill_section:
        skill_lines = skill_section.group(1).split('\n')
        for line in skill_lines:
            m = re.search(r'([A-Za-z\s’]+)\s+(\d+|—|Arduo|Difficile)', line)
            if m:
                skills[m.group(1).strip()] = m.group(2).strip()

    # Resistances / Immunities
    res_match = re.search(r'Resistenze\s+(.*?)\s+(Immunità|Vulnerabilità|GRI)', content, re.DOTALL)
    resistances = res_match.group(1).strip().replace('\n', ' ') if res_match else ""

    imm_match = re.search(r'Immunità\s+(.*?)\s+(Vulnerabilità|GRI)', content, re.DOTALL)
    immunities = imm_match.group(1).strip().replace('\n', ' ') if imm_match else ""

    vul_match = re.search(r'Vulnerabilità\s+(.*?)\s+(GRI|ING|REC)', content, re.DOTALL)
    vulnerabilities = vul_match.group(1).strip().replace('\n', ' ') if vul_match else ""

    # Attacks
    attacks = []
    # Table header: Nome ATT Base Tipo DAN Aff GIT Effetti N°Att
    attack_matches = re.finditer(r'^([A-Za-z\s]+)\s+(\d+)\s+([TCP])\s+([\d+d\d+]+)\s+(\d+|—)\s+(.*?)\s+(\d+)', content, re.MULTILINE)
    for m in attack_matches:
        attacks.append({
            "name": m.group(1).strip(),
            "base": m.group(2).strip(),
            "type": m.group(3).strip(),
            "damage": m.group(4).strip(),
            "reliability": m.group(5).strip(),
            "effects": m.group(6).strip(),
            "num_attacks": m.group(7).strip()
        })

    # Capacities (Detailed paragraphs)
    capacities = []
    cap_matches = re.finditer(r'Capacità:\s*(.*?)\n(.*?)(?=\nCapacità:|\nAttacchi|\nDavide|$)', content, re.DOTALL)
    for m in cap_matches:
        capacities.append({
            "name": m.group(1).strip(),
            "description": m.group(2).strip().replace('\n', ' ')
        })

    # Loot
    loot = []
    loot_section = re.search(r'Bottino\s+(.*?)\s+(SUPERSTIZIONE|Davide)', content, re.DOTALL)
    if loot_section:
        loot_lines = loot_section.group(1).split('\n')
        for line in loot_lines:
            if line.strip(): loot.append(line.strip())

    # Page info
    page = "0"
    p_match = re.search(r'--- Pagina (\d+) ---', content)
    if p_match: page = p_match.group(1)

    return {
        "name": name,
        "stats": stats,
        "meta": meta,
        "skills": skills,
        "resistances": resistances,
        "immunities": immunities,
        "vulnerabilities": vulnerabilities,
        "attacks": attacks,
        "capacities": capacities,
        "loot": loot,
        "page": page,
        "source": "Tomo del Caos"
    }

monster_files = [
    "Pag198_Amalgama di Corpi.txt",
    "Pag200_Armatura Vivente.txt",
    "Pag202_Bes.txt",
    "Pag204_Casglydd.txt",
    "Pag206_Grande Orso.txt",
    "Pag208_Mari Lwyd.txt",
    "Pag210_Penitente.txt"
]

all_monsters = []
base_dir = "e:/AntigravitiProgetti/CompendioTheWitcher/Tomo del Caos/Testi/"

for f in monster_files:
    path = os.path.join(base_dir, f)
    if os.path.exists(path):
        print(f"Parsing {f}...")
        all_monsters.append(parse_chaos_monster(path))

with open("e:/AntigravitiProgetti/CompendioTheWitcher/data/raw_chaos_monsters.json", "w", encoding="utf-8") as out:
    json.dump(all_monsters, out, indent=4, ensure_ascii=False)

print(f"Total monsters extracted: {len(all_monsters)}")
