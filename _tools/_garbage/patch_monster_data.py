
import os
import json
import xml.etree.ElementTree as ET
import re

# Paths
WORKSPACE_ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SCRATCH_DIR = os.path.join(WORKSPACE_ROOT, "_tools", "scratch")
RAW_DATA_DIR = os.path.join(WORKSPACE_ROOT, "_tools", "raw-data")
MONSTER_PACK_DIR = os.path.join(WORKSPACE_ROOT, "_tools", "src-packs", "BESTIARIO", "witcher-monsters")

STATUS_FILE = os.path.join(SCRATCH_DIR, "monster_stats_status.json")
XML_FILES = [
    os.path.join(RAW_DATA_DIR, "Bestiario.xml"),
    os.path.join(RAW_DATA_DIR, "BestiarioDW.xml")
]

# Mapping XML -> JSON keys
STAT_MAP = {
    "INT": "int",
    "RIF": "ref",
    "DES": "dex",
    "FIS": "body",
    "VEL": "spd",
    "EMP": "emp",
    "MAN": "cra",
    "VOL": "will",
    "FOR": "luck"
}

DERIVED_MAP = {
    "GRI": "stun",
    "COR": "resolve",
    "BAL": "woundTreshold",
    "RES": "sta",
    "ING": "focus",
    "REC": "rec",
    "PS": "hp",
    "VIGORE": "vigor"
}

SKILL_MAP = {
    "Accortezza": "awareness",
    "Atletica": "athletics",
    "Coraggio": "courage",
    "Intimidire": "intimidation",
    "Nascondersi": "stealth",
    "Prestanza": "physique",
    "ResistereAllaMagia": "resistmagic",
    "Resistere a Magia": "resistmagic",
    "Rissa": "brawling",
    "Sopravvivenza": "wilderness",
    "Tempra": "endurance",
    "Schivare": "dodge",
    "Istruzione": "education",
    "Mercanteggiare": "business",
    "Deduzione": "deduction",
    "Lingua Comune": "commonsp",
    "Linguaggio Antico": "eldersp",
    "Lingua Nanica": "dwarven",
    "Conoscenza Mostri": "monster",
    "Etichetta Sociale": "socialetq",
    "Vita di Strada": "streetwise",
    "Tattica": "tactics",
    "Insegnamento": "teaching",
    "Cavalcare": "riding",
    "Navigazione": "sailing",
    "Lame Corte": "smallblades",
    "Bastone/Lancia": "staffspear",
    "Scherma": "swordsmanship",
    "Arceria": "archery",
    "Archi": "archery",
    "Balestra": "crossbow",
    "Rapidità di Mano": "sleight",
    "Rapidità Di Mano": "sleight",
    "Alchimia": "alchemy",
    "Creazione": "crafting",
    "Mascheramento": "disguise",
    "Falsificare": "forgery",
    "Borseggiare": "pickpocket",
    "Trappole": "trapcraft",
    "Carisma": "charisma",
    "Comando": "leadership",
    "Persuasione": "persuasion",
    "Recitazione": "performance",
    "Seduzione": "seduction",
    "Empatia": "perception",
    "Percezione": "awareness", # XML Percezione is usually INT-based Awareness
    "Gioco d'Azzardo": "gambling",
    "Trucco": "grooming",
    "Resistenza Coercizione": "resistcoerc",
    "Resistere a Coercizioni": "resistcoerc"
}

# Skill to Attribute mapping
SKILL_ATTR_MAP = {
    "awareness": "int",
    "business": "int",
    "deduction": "int",
    "education": "int",
    "language": "int",
    "eldersp": "int",
    "dwarven": "int",
    "monster": "int",
    "socialetq": "int",
    "streetwise": "int",
    "tactics": "int",
    "teaching": "int",
    "alchemy": "cra",
    "crafting": "cra",
    "disguise": "cra",
    "forgery": "cra",
    "pickpocket": "cra",
    "trapcraft": "cra",
    "athletics": "dex",
    "stealth": "dex",
    "archery": "dex",
    "crossbow": "dex",
    "sleight": "dex",
    "brawling": "ref",
    "dodge": "ref",
    "smallblades": "ref",
    "staffspear": "ref",
    "swordsmanship": "ref",
    "riding": "ref",
    "sailing": "ref",
    "physique": "body",
    "endurance": "body",
    "charisma": "emp",
    "leadership": "emp",
    "persuasion": "emp",
    "performance": "emp",
    "seduction": "emp",
    "perception": "emp",
    "gambling": "emp",
    "grooming": "emp",
    "courage": "will",
    "intimidation": "will",
    "resistcoerc": "will",
    "resistmagic": "will",
    "wilderness": "will"
}

def load_xml_data():
    monsters = {}
    for xml_path in XML_FILES:
        if not os.path.exists(xml_path):
            continue
        try:
            tree = ET.parse(xml_path)
            root = tree.getroot()
            for monster_node in root.findall("SchedaMostro"):
                name_node = monster_node.find("Nome")
                if name_node is not None and name_node.text:
                    name = name_node.text.strip()
                    monsters[name] = monster_node
        except Exception as e:
            print(f"Error parsing {xml_path}: {e}")
    return monsters

def patch_monster(monster_json_path, xml_node):
    with open(monster_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Patch Stats
    stats_node = xml_node.find("Statistiche")
    if stats_node is not None:
        for xml_key, json_key in STAT_MAP.items():
            val_node = stats_node.find(xml_key)
            if val_node is not None:
                try:
                    val = int(val_node.text or 0)
                    if json_key in data["system"]["stats"]:
                        data["system"]["stats"][json_key]["value"] = val
                        data["system"]["stats"][json_key]["max"] = val
                        data["system"]["stats"][json_key]["unmodifiedMax"] = val
                except: pass

    # 2. Patch Derived Stats
    derived_node = xml_node.find("StatisticheDerivate")
    if derived_node is not None:
        for xml_key, json_key in DERIVED_MAP.items():
            val_node = derived_node.find(xml_key)
            if val_node is not None:
                try:
                    val = int(val_node.text or 0)
                    if json_key in data["system"]["derivedStats"]:
                        data["system"]["derivedStats"][json_key]["value"] = val
                        data["system"]["derivedStats"][json_key]["max"] = val
                        data["system"]["derivedStats"][json_key]["unmodifiedMax"] = val
                except: pass

    # 3. Patch Skills
    combat_node = xml_node.find("Combattimento")
    if combat_node is not None:
        skills_node = combat_node.find("BasiDiAbilita")
        if skills_node is not None:
            # Ensure skills structure exists
            if "skills" not in data["system"]:
                data["system"]["skills"] = {}
            
            # Group by attributes
            for attr in ["int", "ref", "dex", "body", "emp", "cra", "will"]:
                if attr not in data["system"]["skills"]:
                    data["system"]["skills"][attr] = {}
            
            for skill_xml_name, json_skill_key in SKILL_MAP.items():
                val_node = skills_node.find(skill_xml_name)
                if val_node is not None:
                    try:
                        val_str = val_node.text.strip().replace('+', '')
                        val = int(val_str)
                        attr_key = SKILL_ATTR_MAP.get(json_skill_key)
                        if attr_key:
                            data["system"]["skills"][attr_key][json_skill_key] = {
                                "value": val,
                                "isVisible": True
                            }
                    except: pass

    # 4. Patch Details
    info_node = xml_node.find("InformazioniGenerali")
    if info_node is not None:
        details = data["system"].get("details", {})
        for field in ["Altezza", "Peso", "Ambiente", "Intelligenza", "Organizzazione"]:
            val_node = info_node.find(field)
            if val_node is not None and val_node.text:
                json_key = field.lower()
                if field == "Altezza": json_key = "height"
                if field == "Peso": json_key = "weight"
                if field == "Ambiente": json_key = "environment"
                if field == "Intelligenza": json_key = "intelligence"
                if field == "Organizzazione": json_key = "organization"
                details[json_key] = val_node.text.strip()
        data["system"]["details"] = details
        
    # 5. Handle sourcebook if possible
    source_node = xml_node.find("Lore/Fonte")
    if source_node is not None and source_node.text:
        data["system"]["sourcebook"] = source_node.text.strip()

    with open(monster_json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def main():
    print("Starting monster data patch...")
    xml_monsters = load_xml_data()
    
    with open(STATUS_FILE, 'r', encoding='utf-8') as f:
        status_data = json.load(f)

    patched_count = 0
    missing_count = 0
    
    for entry in status_data:
        if entry.get("has_stats") is False:
            name = entry["name"]
            file_name = entry["file"]
            json_path = os.path.join(MONSTER_PACK_DIR, file_name)
            
            if name in xml_monsters:
                print(f"Patching {name}...")
                patch_monster(json_path, xml_monsters[name])
                patched_count += 1
            else:
                # Try case insensitive search
                found_ci = False
                for xml_name in xml_monsters:
                    if xml_name.lower() == name.lower():
                        print(f"Patching {name} (CI match: {xml_name})...")
                        patch_monster(json_path, xml_monsters[xml_name])
                        patched_count += 1
                        found_ci = True
                        break
                if not found_ci:
                    print(f"Monster {name} not found in XML files.")
                    missing_count += 1

    print(f"\nPatch complete!")
    print(f"Patched: {patched_count}")
    print(f"Missing in XML: {missing_count}")

if __name__ == "__main__":
    main()
