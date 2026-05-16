
import re
import os
import json
import uuid

xml_path = r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\raw-data\Bestiario.xml'
output_dir = r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-monsters'

with open(xml_path, 'r', encoding='utf-8') as f:
    content = f.read()

monster_blocks = re.findall(r'<SchedaMostro>(.*?)</SchedaMostro>', content, re.DOTALL)

target_names = ["Arciere Scoia'tael", "Bandito", "Contrabbandiere", "Corriere", "Mago", "Scout"]

skill_map = {
    "Accortezza": "int.awareness",
    "Atletica": "dex.athletics",
    "Coraggio": "will.courage",
    "Falsificare": "cra.forgery",
    "Inganno": "emp.deceit",
    "Intimidire": "will.intimidation",
    "Nascondersi": "dex.stealth",
    "Prestanza": "body.physique",
    "RapiditaDiMano": "dex.sleight",
    "ResistereACoercizione": "will.resistCoercion",
    "ResistereAllaMagia": "will.resistMagic",
    "Rissa": "ref.brawling",
    "Sopravvivenza": "int.wildernessSurvival",
    "Tempra": "body.physique",
    "Schivare": "ref.dodge",
    "LameCorte": "ref.smallblades",
    "Scherma": "ref.swordsmanship",
    "Archi": "dex.archery",
    "ArmiInAsta": "ref.staffspear",
    "IntessereFatture": "will.hexWeaving",
    "LanciareIncantesimi": "will.spellCasting",
    "OfficiareRituali": "will.ritualCrafting",
    "ResistereACoercizioni": "will.resistCoercion"
}

def clean_tag(text):
    return re.sub('<[^>]*>', '', text).strip() if text else ""

for block in monster_blocks:
    name_match = re.search(r'<Nome>(.*?)</Nome>', block)
    if not name_match: continue
    name = clean_tag(name_match.group(1))
    if name not in target_names:
        continue
    
    desc_match = re.search(r'<Descrizione>(.*?)</Descrizione>', block, re.DOTALL)
    desc = clean_tag(desc_match.group(1)) if desc_match else ""
    
    def get_tag(tag, source):
        m = re.search(f'<{tag}[^>]*>(.*?)</{tag}>', source, re.DOTALL)
        return clean_tag(m.group(1)) if m else ""

    height = get_tag("Altezza", block)
    weight = get_tag("Peso", block)
    env = get_tag("Ambiente", block)
    intel = get_tag("Intelligenza", block)
    org = get_tag("Organizzazione", block)
    threat = get_tag("Categoria", block)
    diff = get_tag("Complessita", block)
    reward = get_tag("Ricompensa", block)
    
    stats_raw_match = re.search(r'<Statistiche>(.*?)</Statistiche>', block, re.DOTALL)
    stats_dict = {}
    if stats_raw_match:
        stats_raw = stats_raw_match.group(1)
        for tag in ["INT", "RIF", "DES", "FIS", "VEL", "EMP", "MAN", "VOL", "FOR"]:
            val = get_tag(tag, stats_raw)
            stats_dict[tag.lower()] = int(val) if val.isdigit() else 0
    
    der_raw_match = re.search(r'<StatisticheDerivate>(.*?)</StatisticheDerivate>', block, re.DOTALL)
    der_dict = {}
    if der_raw_match:
        der_raw = der_raw_match.group(1)
        for tag, json_key in [("GRI", "woundTreshold"), ("COR", "resolve"), ("BAL", "stun"), ("RES", "sta"), ("REC", "rec"), ("PS", "hp"), ("VIGORE", "vigor")]:
            val = get_tag(tag, der_raw)
            der_dict[json_key] = int(val) if val.isdigit() else 0
    
    skills_raw_match = re.search(r'<BasiDiAbilita>(.*?)</BasiDiAbilita>', block, re.DOTALL)
    skills_json = { "int": {}, "ref": {}, "dex": {}, "body": {}, "emp": {}, "cra": {}, "will": {} }
    if skills_raw_match:
        skills_raw = skills_raw_match.group(1)
        skill_tags = re.findall(r'<([^>]+)>(\d+)</\1>', skills_raw)
        for s_name, s_base in skill_tags:
            if s_name in skill_map:
                path = skill_map[s_name]
                cat, key = path.split('.')
                stat_map_for_sub = {'int':'int', 'ref':'rif', 'dex':'des', 'body':'fis', 'emp':'emp', 'cra':'man', 'will':'vol'}
                stat_key = stat_map_for_sub[cat]
                stat_val = stats_dict.get(stat_key, 0)
                final_val = max(0, int(s_base) - stat_val)
                skills_json[cat][key] = { "value": final_val, "isVisible": True }

    armor = get_tag("Armatura", block)
    armor_val = int(armor) if armor.isdigit() else 0

    common_lore = ""
    common_match = re.search(r'<SuperstizioneComune[^>]*>(.*?)</SuperstizioneComune>', block, re.DOTALL)
    if common_match:
        common_lore = get_tag("Testo", common_match.group(1))
    
    acad_lore = ""
    acad_match = re.search(r'<ConoscenzaAccademica[^>]*>(.*?)</ConoscenzaAccademica>', block, re.DOTALL)
    if acad_match:
        acad_lore = get_tag("Testo", acad_match.group(1))

    safe_name = name.lower().replace(' ', '_').replace("'", "_")
    
    monster_json = {
        "_id": uuid.uuid4().hex[:16],
        "name": name,
        "type": "monster",
        "img": f"modules/witcher-compendium/assets/BESTIARIO/witcher-monsters/{safe_name}.webp",
        "system": {
            "stats": {
                "int": { "value": stats_dict.get('int',0), "max": stats_dict.get('int',0), "unmodifiedMax": stats_dict.get('int',0) },
                "ref": { "value": stats_dict.get('rif',0), "max": stats_dict.get('rif',0), "unmodifiedMax": stats_dict.get('rif',0) },
                "dex": { "value": stats_dict.get('des',0), "max": stats_dict.get('des',0), "unmodifiedMax": stats_dict.get('des',0) },
                "body": { "value": stats_dict.get('fis',0), "max": stats_dict.get('fis',0), "unmodifiedMax": stats_dict.get('fis',0) },
                "spd": { "value": stats_dict.get('vel',0), "max": stats_dict.get('vel',0), "unmodifiedMax": stats_dict.get('vel',0) },
                "emp": { "value": stats_dict.get('emp',0), "max": stats_dict.get('emp',0), "unmodifiedMax": stats_dict.get('emp',0) },
                "cra": { "value": stats_dict.get('man',0), "max": stats_dict.get('man',0), "unmodifiedMax": stats_dict.get('man',0) },
                "will": { "value": stats_dict.get('vol',0), "max": stats_dict.get('vol',0), "unmodifiedMax": stats_dict.get('vol',0) },
                "luck": { "value": stats_dict.get('for',0), "max": stats_dict.get('for',0), "unmodifiedMax": stats_dict.get('for',0) }
            },
            "skills": skills_json,
            "details": {
                "biography": f"<p>{desc}</p>",
                "threat": threat,
                "reward": int(reward) if reward.isdigit() else 0,
                "monsterType": "Humanoid",
                "difficulty": diff.upper()
            },
            "derivedStats": {
                "hp": { "value": der_dict.get('hp',0), "max": der_dict.get('hp',0), "unmodifiedMax": der_dict.get('hp',0) },
                "sta": { "value": der_dict.get('sta',0), "max": der_dict.get('sta',0), "unmodifiedMax": der_dict.get('sta',0) },
                "rec": { "value": der_dict.get('rec',0), "max": der_dict.get('rec',0), "unmodifiedMax": der_dict.get('rec',0) },
                "stun": { "value": der_dict.get('stun',0), "max": der_dict.get('stun',0) },
                "woundTreshold": { "value": der_dict.get('woundTreshold',0), "max": der_dict.get('woundTreshold',0) },
                "resolve": { "value": der_dict.get('resolve',0), "max": der_dict.get('resolve',0), "unmodifiedMax": der_dict.get('resolve',0) },
                "vigor": { "value": der_dict.get('vigor',0), "max": der_dict.get('vigor',0), "unmodifiedMax": der_dict.get('vigor',0) }
            },
            "armorHead": armor_val,
            "armorUpper": armor_val,
            "armorLower": armor_val,
            "height": height,
            "weight": weight,
            "environment": env,
            "intelligence": intel,
            "organization": org,
            "common": common_lore,
            "academicKnowledge": acad_lore,
            "bounty": int(reward) if reward.isdigit() else 0
        },
        "items": [],
        "effects": [],
        "flags": {},
        "_stats": { "systemId": "TheWitcherItaNewSystem", "coreVersion": 14 }
    }

    file_name = f"{safe_name}_{monster_json['_id']}.json"
    with open(os.path.join(output_dir, file_name), 'w', encoding='utf-8') as out:
        json.dump(monster_json, out, indent=4, ensure_ascii=False)
    print(f"Created {file_name}")

