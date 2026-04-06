import json
import os
import uuid
import re

def generate_id():
    return uuid.uuid4().hex[:16]

def clean_html(text):
    if not text: return ""
    # Remove excessive newlines
    text = text.replace('\n', ' ').replace('  ', ' ')
    # Simple HTML wrapping
    return f"<p>{text.strip()}</p>"

def to_num(val, default=0):
    if val is None: return default
    try:
        if isinstance(val, str):
            val = val.replace(',', '.')
            # Remove any non-numeric chars except . and -
            val = re.sub(r'[^0-9.\-]', '', val)
        return float(val) if '.' in str(val) else int(val)
    except:
        return default

def convert_item(raw, item_type, img_placeholder):
    foundry_item = {
        "_id": generate_id(),
        "name": raw.get("name", "Unknown Item"),
        "type": item_type,
        "img": img_placeholder,
        "system": {},
        "effects": [],
        "folder": None,
        "sort": 0,
        "ownership": { "default": 0 },
        "flags": {},
        "_stats": { "systemId": "TheWitcherTRPG", "systemVersion": "1.0.0", "coreVersion": "13" }
    }
    
    # Mapping system fields
    sys = foundry_item["system"]
    sys["description"] = clean_html(raw.get("description", raw.get("effect", "")))
    sys["weight"] = to_num(raw.get("weight", 0))
    sys["cost"] = to_num(raw.get("cost", 0))
    
    # Specific mappings
    if item_type == "weapon":
        sys["damage"] = raw.get("damage", "1d6")
        rel = to_num(raw.get("reliability", 10))
        sys["reliability"] = { "value": rel, "max": rel }
        sys["accuracy"] = to_num(raw.get("pa", raw.get("accuracy", 0)))
        sys["hands"] = to_num(raw.get("hands", 1))
        sys["reach"] = raw.get("range", "N/A")
        sys["effects"] = raw.get("effects", "")
    elif item_type == "armor":
        sys["stoppingPower"] = to_num(raw.get("pa", 0))
        rel = to_num(raw.get("reliability", 10))
        sys["reliability"] = { "value": rel, "max": rel }
    elif item_type in ["spell", "ritual", "hex"]:
        sys["cost"] = to_num(raw.get("cost_res", raw.get("cost", 0)))
        sys["range"] = raw.get("range", "N/A")
        sys["duration"] = raw.get("duration", "N/A")
        sys["effect"] = raw.get("effect", "")
    elif item_type == "alchemical":
        sys["toxicity"] = raw.get("toxicity", "0%")
        sys["duration"] = raw.get("duration", "N/A")
    elif item_type == "diagrams":
        sys["components"] = raw.get("components", "")
        sys["difficulty"] = to_num(raw.get("cd", 0))
        sys["time"] = raw.get("time", "")

    return foundry_item

def convert_monster(raw, img_placeholder):
    foundry_actor = {
        "_id": generate_id(),
        "name": raw.get("name", "Unknown Monster"),
        "type": "monster",
        "img": img_placeholder,
        "system": {
            "stats": {},
            "skills": {},
            "details": {
                "biography": clean_html(raw.get("general_info", {}).get("Ambiente", "")),
                "threat": raw.get("threat", ""),
                "reward": raw.get("reward", 0)
            }
        },
        "items": [],
        "effects": [],
        "ownership": { "default": 0 },
        "flags": {},
        "_stats": { "systemId": "TheWitcherTRPG", "systemVersion": "1.0.0", "coreVersion": "13" }
    }
    
    # Mapping stats
    raw_stats = raw.get("stats", {})
    actor_stats = foundry_actor["system"]["stats"]
    for s in ["INT", "RIF", "DES", "FIS", "VEL", "EMP", "MAN", "VOL", "FOR", "GRI", "COR", "BAL", "RES", "ING", "REC", "PS", "VIGORE"]:
        val = raw_stats.get(s, 0)
        actor_stats[s.lower()] = { "value": val, "max": val }

    # Mapping skills
    raw_skills = raw.get("skills", {})
    actor_skills = foundry_actor["system"]["skills"]
    for s_name, s_val in raw_skills.items():
        # Skill name mapping might be needed
        clean_name = s_name.lower().replace(" ", "")
        try:
            actor_skills[clean_name] = { "value": int(s_val.replace('+', '')) }
        except:
            actor_skills[clean_name] = { "value": 0 }

    # Embedded weapons as items
    for w in raw.get("weapons", []):
        foundry_actor["items"].append(convert_item(w, "weapon", "icons/svg/sword.svg"))

    return foundry_actor

def main():
    packs_map = [
        {"file": "raw_weapons.json", "pack": "witcher-weapons", "type": "weapon", "img": "icons/svg/sword.svg"},
        {"file": "raw_armors.json", "pack": "witcher-armor", "type": "armor", "img": "icons/svg/shield.svg"},
        {"file": "raw_general_items.json", "pack": "witcher-equipment", "type": "valuable", "img": "icons/svg/item-bag.svg"},
        {"file": "raw_magic.json", "pack": "witcher-spells", "type": "spell", "img": "icons/svg/mage-hand.svg"},
        {"file": "raw_rituals_hexes.json", "pack": "witcher-rituals", "type": "ritual", "img": "icons/svg/circle-magic.svg"}, # Should handle rituals vs hexes
        {"file": "raw_crafting_components.json", "pack": "witcher-components", "type": "component", "img": "icons/svg/coin-silver.svg"},
        {"file": "raw_crafting_schematics.json", "pack": "witcher-schematics", "type": "diagrams", "img": "icons/svg/blueprint.svg"},
        {"file": "raw_alchemy_substances.json", "pack": "witcher-alchemy", "type": "alchemical", "img": "icons/svg/flask.svg"},
        {"file": "raw_alchemy_items.json", "pack": "witcher-alchemy", "type": "alchemical", "img": "icons/svg/potion.svg"},
        {"file": "raw_witcher_gear.json", "pack": "witcher-special", "type": "weapon", "img": "icons/svg/mystery-man.svg"}, # Most are swords/potions
        {"file": "raw_monsters.json", "pack": "witcher-monsters", "type": "monster", "img": "icons/svg/demon.svg"}
    ]
    
    total_entries = 0
    
    for mapping in packs_map:
        raw_path = os.path.join("data", mapping["file"])
        if not os.path.exists(raw_path):
            print(f"File {raw_path} not found, skipping...")
            continue
            
        with open(raw_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        pack_dir = os.path.join("TheWitcherFoundry", "packs", mapping["pack"])
        if not os.path.exists(pack_dir): os.makedirs(pack_dir)
            
        print(f"Converting {mapping['file']} to {mapping['pack']}...")
        
        for record in data:
            if mapping["type"] == "monster":
                foundry_entry = convert_monster(record, mapping["img"])
            else:
                # Some files like raw_rituals_hexes have multiple types mixed
                actual_type = mapping["type"]
                if "type" in record:
                    if record["type"] == "Hex": actual_type = "hex"
                    elif record["type"] == "Ritual": actual_type = "ritual"
                
                # For witcher special gear
                if mapping["pack"] == "witcher-special":
                    if record.get("type") == "Weapon": actual_type = "weapon"
                    elif record.get("type") == "Oil": actual_type = "alchemical"
                    elif record.get("type") in ["Potion", "Decoction"]: actual_type = "alchemical"

                foundry_entry = convert_item(record, actual_type, mapping["img"])
            
            # Clean name for filename
            clean_name = "".join([c for c in foundry_entry["name"] if c.isalnum() or c in (" ", "_")]).strip().replace(" ", "_")
            file_name = f"{clean_name}_{foundry_entry['_id']}.json"
            
            with open(os.path.join(pack_dir, file_name), "w", encoding="utf-8") as out:
                json.dump(foundry_entry, out, indent=4, ensure_ascii=False)
            total_entries += 1
            
    print(f"Sprint 1 Conversion finished. Total entries: {total_entries}")

if __name__ == "__main__":
    main()
