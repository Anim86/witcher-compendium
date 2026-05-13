
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

# Load existing JSONs to preserve IDs
json_files = {}
for d in dirs:
    for filename in os.listdir(d):
        if filename.endswith('.json'):
            path = os.path.join(d, filename)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    json_files[data['name'].lower()] = {"path": path, "data": data}
            except: pass

skill_map = {
    "Accortezza": "int.awareness", "Atletica": "dex.athletics", "Coraggio": "will.courage",
    "Falsificare": "cra.forgery", "Inganno": "emp.deceit", "Intimidire": "will.intimidation",
    "Nascondersi": "dex.stealth", "Prestanza": "body.physique", "RapiditaDiMano": "dex.sleight",
    "ResistereACoercizione": "will.resistCoercion", "ResistereAllaMagia": "will.resistMagic",
    "Rissa": "ref.brawling", "Sopravvivenza": "int.wildernessSurvival", "Tempra": "body.endurance",
    "Schivare": "ref.dodge", "LameCorte": "ref.smallblades", "Scherma": "ref.swordsmanship",
    "Archi": "dex.archery", "ArmiInAsta": "ref.staffspear", "IntessereFatture": "will.hexWeaving",
    "LanciareIncantesimi": "will.spellCasting", "OfficiareRituali": "will.ritualCrafting",
    "ResistereACoercizioni": "will.resistCoercion", "Mischia": "ref.melee", "Riposizionare": "dex.athletics"
}

def clean_tag(text):
    if not text: return ""
    return re.sub('<[^>]*>', '', text).strip()

def get_tag(tag, source):
    m = re.search(f'<{tag}[^>]*>(.*?)</{tag}>', source, re.DOTALL)
    return m.group(1) if m else ""

monster_blocks = re.findall(r'<SchedaMostro>(.*?)</SchedaMostro>', xml_content, re.DOTALL)

for block in monster_blocks:
    name_xml = clean_tag(get_tag("Nome", block))
    if not name_xml: continue
    
    # Matching
    target = None
    name_l = name_xml.lower()
    if name_l in json_files: target = json_files[name_l]
    else:
        # Fuzzy
        for k, v in json_files.items():
            if k.startswith(name_l[:5]) or name_l.startswith(k[:5]):
                target = v; break

    if not target: continue

    # Extract Items
    items = []
    
    # Weapons
    armi_raw = get_tag("Armi", block)
    if armi_raw:
        armi = re.findall(r'<Arma>(.*?)</Arma>', armi_raw, re.DOTALL)
        for a in armi:
            a_name = clean_tag(get_tag("Nome", a))
            a_dmg = clean_tag(get_tag("Danno", a))
            a_eff = clean_tag(get_tag("Effetti", a))
            items.append({
                "_id": uuid.uuid4().hex[:16],
                "name": a_name,
                "type": "weapon",
                "img": "modules/witcher-compendium/assets/SPECIAL/trait_zanne.webp" if "Morso" in a_name or "Artigli" in a_name else "modules/witcher-compendium/assets/SPECIAL/weapon_sword.webp",
                "system": { "description": a_eff, "damage": a_dmg, "accuracy": 0, "effects": a_eff },
                "_stats": { "systemId": "TheWitcherItaNewSystem", "coreVersion": 14 }
            })

    # Capacities (Traits)
    cap_raw = get_tag("Capacita", block)
    if cap_raw:
        tratti = re.findall(r'<Tratto>(.*?)</Tratto>', cap_raw, re.DOTALL)
        for t in tratti:
            t_name = clean_tag(get_tag("Nome", t))
            t_desc = clean_tag(get_tag("Descrizione", t))
            items.append({
                "_id": uuid.uuid4().hex[:16],
                "name": f"[Capacità] {t_name}",
                "type": "note",
                "img": "modules/witcher-compendium/assets/BESTIARIO/traits/trait_generico.webp",
                "system": { "description": f"<p>{t_desc}</p>" },
                "_stats": { "systemId": "TheWitcherItaNewSystem", "coreVersion": 14 }
            })

    # Loot
    loot_raw = get_tag("Bottino", block)
    if loot_raw:
        oggetti = re.findall(r'<Oggetto>(.*?)</Oggetto>', loot_raw, re.DOTALL)
        for o in oggetti:
            o_name = clean_tag(get_tag("Nome", o))
            o_qty = clean_tag(get_tag("Quantita", o))
            items.append({
                "_id": uuid.uuid4().hex[:16],
                "name": f"{o_name} (x{o_qty})",
                "type": "valuable",
                "img": "modules/witcher-compendium/assets/SPECIAL/item_loot.webp",
                "system": { "description": f"Quantità: {o_qty}" },
                "_stats": { "systemId": "TheWitcherItaNewSystem", "coreVersion": 14 }
            })

    # Update JSON
    data = target['data']
    data['items'] = items
    
    # Final Skill Mapping check
    stats_raw = get_tag("Statistiche", block)
    stats_dict = {}
    for tag in ["INT", "RIF", "DES", "FIS", "VEL", "EMP", "MAN", "VOL", "FOR"]:
        val = clean_tag(get_tag(tag, stats_raw))
        stats_dict[tag.lower()] = int(val) if val.isdigit() else 0
    
    skills_raw = get_tag("BasiDiAbilita", block)
    if skills_raw:
        skill_tags = re.findall(r'<([^>]+)>(\d+)</\1>', skills_raw)
        sys_skills = data['system'].setdefault('skills', { "int": {}, "ref": {}, "dex": {}, "body": {}, "emp": {}, "cra": {}, "will": {} })
        for s_name, s_base in skill_tags:
            if s_name in skill_map:
                path = skill_map[s_name]
                cat, key = path.split('.')
                stat_map_for_sub = {'int':'int', 'ref':'rif', 'dex':'des', 'body':'fis', 'emp':'emp', 'cra':'man', 'will':'vol'}
                stat_key = stat_map_for_sub.get(cat, 'int')
                final_val = max(0, int(s_base) - stats_dict.get(stat_key, 0))
                sys_skills.setdefault(cat, {})[key] = { "value": final_val, "isVisible": True }

    with open(target['path'], 'w', encoding='utf-8') as out:
        json.dump(data, out, indent=4, ensure_ascii=False)
    print(f"Final Polishing: {target['path']}")

print("Final Check & Polishing Completed.")
