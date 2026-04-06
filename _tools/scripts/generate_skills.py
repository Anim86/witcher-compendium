import json
import os
import uuid
import secrets

def generate_id():
    return secrets.token_hex(8)

skills_data = [
    # INT
    {"name": "Consapevolezza", "attr": "int", "cost": 1},
    {"name": "Affari", "attr": "int", "cost": 1},
    {"name": "Deduzione", "attr": "int", "cost": 1},
    {"name": "Istruzione", "attr": "int", "cost": 1},
    {"name": "Lingua Comune", "attr": "int", "cost": 2},
    {"name": "Lingua Antica", "attr": "int", "cost": 2},
    {"name": "Lingua Nanica", "attr": "int", "cost": 2},
    {"name": "Conoscenza Mostri", "attr": "int", "cost": 2},
    {"name": "Etichetta Sociale", "attr": "int", "cost": 1},
    {"name": "Vita di Strada", "attr": "int", "cost": 1},
    {"name": "Tattica", "attr": "int", "cost": 2},
    {"name": "Insegnare", "attr": "int", "cost": 1},
    {"name": "Sopravvivenza", "attr": "int", "cost": 1},
    # REF
    {"name": "Rissa", "attr": "ref", "cost": 1},
    {"name": "Schivare/Fuggire", "attr": "ref", "cost": 1},
    {"name": "Mischia", "attr": "ref", "cost": 1},
    {"name": "Equitazione", "attr": "ref", "cost": 1},
    {"name": "Navigazione", "attr": "ref", "cost": 1},
    {"name": "Lame Piccole", "attr": "ref", "cost": 1},
    {"name": "Asta/Lancia", "attr": "ref", "cost": 1},
    {"name": "Scherma", "attr": "ref", "cost": 1},
    # DEX
    {"name": "Tiro con l'Arco", "attr": "dex", "cost": 1},
    {"name": "Atletica", "attr": "dex", "cost": 1},
    {"name": "Balestra", "attr": "dex", "cost": 1},
    {"name": "Prestigiditazione", "attr": "dex", "cost": 1},
    {"name": "Furtività", "attr": "dex", "cost": 1},
    # BODY
    {"name": "Fisicità", "attr": "body", "cost": 1},
    {"name": "Resistenza", "attr": "body", "cost": 1},
    # EMP
    {"name": "Carisma", "attr": "emp", "cost": 1},
    {"name": "Inganno", "attr": "emp", "cost": 1},
    {"name": "Belle Arti", "attr": "emp", "cost": 1},
    {"name": "Gioco d'Azzardo", "attr": "emp", "cost": 1},
    {"name": "Cura e Stile", "attr": "emp", "cost": 1},
    {"name": "Percezione Umana", "attr": "emp", "cost": 1},
    {"name": "Autorità", "attr": "emp", "cost": 1},
    {"name": "Persuasione", "attr": "emp", "cost": 1},
    {"name": "Recitazione", "attr": "emp", "cost": 1},
    {"name": "Seduzione", "attr": "emp", "cost": 1},
    # CRA / ART
    {"name": "Alchimia", "attr": "cra", "cost": 2},
    {"name": "Artigianato", "attr": "cra", "cost": 2},
    {"name": "Camuffamento", "attr": "cra", "cost": 1},
    {"name": "Pronto Soccorso", "attr": "cra", "cost": 1},
    {"name": "Contraffazione", "attr": "cra", "cost": 1},
    {"name": "Scassinare", "attr": "cra", "cost": 1},
    {"name": "Fabbricare Trappole", "attr": "cra", "cost": 2},
    # WILL / VOL
    {"name": "Coraggio", "attr": "will", "cost": 1},
    {"name": "Tessere Fatture", "attr": "will", "cost": 2},
    {"name": "Intimidazione", "attr": "will", "cost": 1},
    {"name": "Lanciare Incantesimi", "attr": "will", "cost": 2},
    {"name": "Resistere alla Magia", "attr": "will", "cost": 2},
    {"name": "Resistere alla Coercizione", "attr": "will", "cost": 1},
    {"name": "Creare Rituali", "attr": "will", "cost": 2},
]

output_dir = "e:/AntigravitiProgetti/CompendioTheWitcher/../src-packs/witcher-skills"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for skill in skills_data:
    safe_name = skill["name"].lower().replace(" ", "_").replace("/", "_").replace("'", "_")
    skill_id = generate_id()
    
    item_data = {
        "_id": skill_id,
        "name": skill["name"],
        "type": "skill",
        "img": "icons/svg/skill.svg",
        "system": {
            "attribute": skill["attr"],
            "value": 0,
            "label": "",
            "isOpened": False,
            "modifiers": [],
            "activeEffectModifiers": 0,
            "isProfession": False,
            "isPickup": False,
            "isLearned": False
        },
        "effects": [],
        "folder": None,
        "sort": 0,
        "ownership": {
            "default": 0
        },
        "flags": {},
        "_stats": {
            "systemId": "TheWitcherTRPG",
            "systemVersion": "1.0.0",
            "coreVersion": "13"
        }
    }
    
    # We might need to handle the cost-2 logic. In some systems cost is a field.
    # Looking at WitcherCharacterWizard.js, it uses CONFIG.WITCHER.skillMap to find costs.
    # But if I want the item to store it, maybe it goes in system.value or a custom field?
    # Based on SkillItemData.js, there is NO cost field. It's indeed handled by CONFIG.
    
    file_path = os.path.join(output_dir, f"{safe_name}_{skill_id}.json")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(item_data, f, ensure_ascii=False, indent=4)

print(f"Generated {len(skills_data)} skill JSON files.")

