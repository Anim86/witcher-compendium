
import re
import os
import json
import uuid

xml_path = r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\raw-data\Bestiario.xml'
dirs = [
    r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-monsters',
    r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-animals'
]

with open(xml_path, 'r', encoding='utf-8') as f:
    xml_content = f.read()

# Pre-load JSON files for matching
json_files = {}
for d in dirs:
    for filename in os.listdir(d):
        if filename.endswith('.json'):
            path = os.path.join(d, filename)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    name = data.get("name", "").lower()
                    json_files[name] = {"path": path, "data": data}
            except: pass

# Skill Mapping IT -> EN
skill_map = {
    "Accortezza": "int.awareness", "Atletica": "dex.athletics", "Coraggio": "will.courage",
    "Falsificare": "cra.forgery", "Inganno": "emp.deceit", "Intimidire": "will.intimidation",
    "Nascondersi": "dex.stealth", "Prestanza": "body.physique", "RapiditaDiMano": "dex.sleight",
    "ResistereACoercizione": "will.resistCoercion", "ResistereAllaMagia": "will.resistMagic",
    "Rissa": "ref.brawling", "Sopravvivenza": "int.wildernessSurvival", "Tempra": "body.physique",
    "Schivare": "ref.dodge", "LameCorte": "ref.smallblades", "Scherma": "ref.swordsmanship",
    "Archi": "dex.archery", "ArmiInAsta": "ref.staffspear", "IntessereFatture": "will.hexWeaving",
    "LanciareIncantesimi": "will.spellCasting", "OfficiareRituali": "will.ritualCrafting",
    "ResistereACoercizioni": "will.resistCoercion"
}

def clean_tag(text):
    return re.sub('<[^>]*>', '', text).strip() if text else ""

def get_tag(tag, source):
    m = re.search(f'<{tag}[^>]*>(.*?)</{tag}>', source, re.DOTALL)
    return clean_tag(m.group(1)) if m else ""

monster_blocks = re.findall(r'<SchedaMostro>(.*?)</SchedaMostro>', xml_content, re.DOTALL)

for block in monster_blocks:
    name_xml = get_tag("Nome", block)
    if not name_xml: continue
    
    # Matching Logic
    target_json = None
    name_lower = name_xml.lower()
    
    # Direct match
    if name_lower in json_files:
        target_json = json_files[name_lower]
    else:
        # Fuzzy match for plural/singular
        plural_name = name_lower + "e" if name_lower.endswith('a') else name_lower + "i"
        if plural_name in json_files:
            target_json = json_files[plural_name]
        elif name_lower.rstrip('i').rstrip('e') in [k.rstrip('i').rstrip('e') for k in json_files.keys()]:
            # Simple stem match
            stem = name_lower.rstrip('i').rstrip('e')
            for k, v in json_files.items():
                if k.startswith(stem):
                    target_json = v
                    break

    # Extract Data from XML
    desc = get_tag("Descrizione", block)
    height = get_tag("Altezza", block)
    weight = get_tag("Peso", block)
    env = get_tag("Ambiente", block)
    intel = get_tag("Intelligenza", block)
    org = get_tag("Organizzazione", block)
    threat = get_tag("Categoria", block)
    diff = get_tag("Complessita", block)
    reward = get_tag("Ricompensa", block)
    
    # Stats
    stats_raw_match = re.search(r'<Statistiche>(.*?)</Statistiche>', block, re.DOTALL)
    stats_dict = {}
    if stats_raw_match:
        for tag in ["INT", "RIF", "DES", "FIS", "VEL", "EMP", "MAN", "VOL", "FOR"]:
            val = get_tag(tag, stats_raw_match.group(1))
            stats_dict[tag.lower()] = int(val) if val.isdigit() else 0
    
    # Derived
    der_raw_match = re.search(r'<StatisticheDerivate>(.*?)</StatisticheDerivate>', block, re.DOTALL)
    der_dict = {}
    if der_raw_match:
        for tag, json_key in [("GRI", "woundTreshold"), ("COR", "resolve"), ("BAL", "stun"), ("RES", "sta"), ("REC", "rec"), ("PS", "hp"), ("VIGORE", "vigor")]:
            val = get_tag(tag, der_raw_match.group(1))
            der_dict[json_key] = int(val) if val.isdigit() else 0
    
    # Skills
    skills_json = { "int": {}, "ref": {}, "dex": {}, "body": {}, "emp": {}, "cra": {}, "will": {} }
    skills_raw_match = re.search(r'<BasiDiAbilita>(.*?)</BasiDiAbilita>', block, re.DOTALL)
    if skills_raw_match:
        skill_tags = re.findall(r'<([^>]+)>(\d+)</\1>', skills_raw_match.group(1))
        for s_name, s_base in skill_tags:
            if s_name in skill_map:
                path = skill_map[s_name]
                cat, key = path.split('.')
                stat_map_for_sub = {'int':'int', 'ref':'rif', 'dex':'des', 'body':'fis', 'emp':'emp', 'cra':'man', 'will':'vol'}
                stat_key = stat_map_for_sub.get(cat, 'int')
                stat_val = stats_dict.get(stat_key, 0)
                final_val = max(0, int(s_base) - stat_val)
                skills_json[cat][key] = { "value": final_val, "isVisible": True }

    armor = get_tag("Armatura", block)
    armor_val = int(armor) if armor.isdigit() else 0

    common_lore = ""
    common_match = re.search(r'<SuperstizioneComune[^>]*>(.*?)</SuperstizioneComune>', block, re.DOTALL)
    if common_match: common_lore = get_tag("Testo", common_match.group(1))
    
    acad_lore = ""
    acad_match = re.search(r'<ConoscenzaAccademica[^>]*>(.*?)</ConoscenzaAccademica>', block, re.DOTALL)
    if acad_match: acad_lore = get_tag("Testo", acad_match.group(1))

    # Prepare Updated Data
    if target_json:
        # UPDATE EXISTING
        data = target_json['data']
        sys = data.setdefault('system', {})
        
        # Preserve Name if match was plural
        # data['name'] = name_xml # User might want to keep the original name or update it. Let's update it to XML.
        
        # Update Stats
        sys_stats = sys.setdefault('stats', {})
        stat_map_json = {'int':'int', 'rif':'ref', 'des':'dex', 'fis':'body', 'vel':'spd', 'emp':'emp', 'man':'cra', 'vol':'will', 'for':'luck'}
        for xml_stat, json_stat in stat_map_json.items():
            val = stats_dict.get(xml_stat, 0)
            sys_stats[json_stat] = { "value": val, "max": val, "unmodifiedMax": val }
            
        # Update Skills (Grouped)
        sys['skills'] = skills_json
        
        # Update Derived
        sys_der = sys.setdefault('derivedStats', {})
        for k, v in der_dict.items():
            sys_der[k] = { "value": v, "max": v, "unmodifiedMax": v }
        
        # Details & Lore
        det = sys.setdefault('details', {})
        det['biography'] = f"<p>{desc}</p>"
        det['threat'] = threat
        det['difficulty'] = diff.upper()
        det['reward'] = int(reward) if reward.isdigit() else 0
        
        sys['armorHead'] = armor_val
        sys['armorUpper'] = armor_val
        sys['armorLower'] = armor_val
        sys['height'] = height
        sys['weight'] = weight
        sys['environment'] = env
        sys['intelligence'] = intel
        sys['organization'] = org
        sys['common'] = common_lore
        sys['academicKnowledge'] = acad_lore
        sys['bounty'] = int(reward) if reward.isdigit() else 0

        with open(target_json['path'], 'w', encoding='utf-8') as out:
            json.dump(data, out, indent=4, ensure_ascii=False)
        print(f"Updated: {target_json['path']}")
    else:
        # CREATE NEW (if not already handled)
        # Skip for now as we just did humanoids, but we could create other missing ones here.
        pass

print("Global Update Completed.")
