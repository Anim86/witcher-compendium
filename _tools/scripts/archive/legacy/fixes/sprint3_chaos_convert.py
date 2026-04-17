import json
import os
import uuid
import re

def generate_id():
    return uuid.uuid4().hex[:16]

def clean_html(text):
    if not text: return ""
    text = text.replace('\n', ' ').replace('  ', ' ')
    return f"<p>{text.strip()}</p>"

def to_num(val, default=0):
    if val is None: return default
    try:
        if isinstance(val, str):
            val = val.replace(',', '.')
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
    
    sys = foundry_item["system"]
    desc = raw.get("description", raw.get("effect", ""))
    sys["description"] = clean_html(desc)
    sys["weight"] = to_num(raw.get("weight", 0))
    sys["cost"] = to_num(raw.get("cost", 0))
    
    if item_type == "spell":
        sys["cost"] = to_num(raw.get("cost", 0))
        sys["range"] = raw.get("range", "N/A")
        sys["duration"] = raw.get("duration", "N/A")
        sys["defense"] = raw.get("defense", "N/A")
        sys["tier"] = raw.get("tier", "Novizio")
        sys["subtype"] = raw.get("subtype", "Misto")
        sys["category"] = raw.get("category", "Mago") # Mago, Prete, Druido
    elif item_type == "ritual":
        sys["cost"] = to_num(raw.get("cost", 0))
        sys["prepTime"] = raw.get("prep_time", "")
        sys["difficulty"] = raw.get("difficulty", "")
        sys["duration"] = raw.get("duration", "")
        sys["components"] = raw.get("components", "")
    elif item_type == "hex":
        sys["cost"] = to_num(raw.get("cost", 0))
        sys["difficulty"] = raw.get("difficulty", "")
    elif item_type == "alchemical":
        sys["toxicity"] = raw.get("toxicity", "0%")
    elif item_type == "valuable":
        # For magic items with CD
        if "istruzione_cd" in raw:
            sys["description"] += f"<p><strong>Istruzione CD:</strong> {raw['istruzione_cd']}</p>"

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
                "biography": clean_html(raw.get("meta", {}).get("Ambiente", "")),
                "threat": "Arduo", # Fallback
                "reward": to_num(raw.get("meta", {}).get("Ricompensa", 0))
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
    for s in ["INT", "RIF", "DES", "FIS", "VEL", "EMP", "MAN", "VOL", "GRI", "COR", "BAL", "RES", "ING", "REC", "PS"]:
        val = to_num(raw_stats.get(s, 0))
        actor_stats[s.lower()] = { "value": val, "max": val }

    # Mapping skills
    raw_skills = raw.get("skills", {})
    actor_skills = foundry_actor["system"]["skills"]
    for s_name, s_val in raw_skills.items():
        clean_name = s_name.lower().replace(" ", "")
        val = to_num(s_val)
        actor_skills[clean_name] = { "value": val }

    # Embedded attacks
    for att in raw.get("attacks", []):
        item = convert_item(att, "weapon", "icons/svg/sword.svg")
        item["system"]["damage"] = att.get("damage", "1d6")
        item["system"]["reliability"] = { "value": to_num(att.get("reliability", 10)), "max": to_num(att.get("reliability", 10)) }
        foundry_actor["items"].append(item)

    # Capacities as notes in biography
    bio = foundry_actor["system"]["details"]["biography"]
    bio += "<h3>Capacità Speciali</h3>"
    for cap in raw.get("capacities", []):
        bio += f"<p><strong>{cap['name']}:</strong> {cap['description']}</p>"
    foundry_actor["system"]["details"]["biography"] = bio

    return foundry_actor

def main():
    packs_map = [
        {"file": "raw_chaos_magic.json", "pack": "witcher-spells-chaos", "type": "spell", "img": "icons/svg/lightning.svg"},
        {"file": "raw_chaos_rituals.json", "pack": "witcher-rituals-chaos", "type": "ritual", "img": "icons/svg/book.svg"},
        {"file": "raw_chaos_items.json", "pack": "witcher-items-chaos", "type": "valuable", "img": "icons/svg/item-bag.svg"},
        {"file": "raw_chaos_monsters.json", "pack": "witcher-monsters-chaos", "type": "monster", "img": "icons/svg/skull.svg"}
    ]
    
    total_entries = 0
    base_dir = "e:/AntigravitiProgetti/CompendioTheWitcher/"
    
    for mapping in packs_map:
        raw_path = os.path.join(base_dir, "data", mapping["file"])
        if not os.path.exists(raw_path):
            print(f"File {raw_path} not found, skipping...")
            continue
            
        with open(raw_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        pack_dir = os.path.join(base_dir, "TheWitcherFoundry", "packs", mapping["pack"])
        if not os.path.exists(pack_dir): os.makedirs(pack_dir)
            
        print(f"Converting {mapping['file']} to {mapping['pack']}...")
        
        for record in data:
            if mapping["type"] == "monster":
                foundry_entry = convert_monster(record, mapping["img"])
            else:
                actual_type = mapping["type"]
                if record.get("type") == "Hex": actual_type = "hex"
                elif record.get("type") == "Ritual": actual_type = "ritual"
                elif record.get("type") == "Elisir": actual_type = "alchemical"
                
                foundry_entry = convert_item(record, actual_type, mapping["img"])
            
            clean_name = "".join([c for c in foundry_entry["name"] if c.isalnum() or c in (" ", "_")]).strip().replace(" ", "_")
            file_name = f"{clean_name}_{foundry_entry['_id']}.json"
            
            with open(os.path.join(pack_dir, file_name), "w", encoding="utf-8") as out:
                json.dump(foundry_entry, out, indent=4, ensure_ascii=False)
            total_entries += 1
            
    print(f"Sprint 3 Conversion finished. Total entries: {total_entries}")

if __name__ == "__main__":
    main()
