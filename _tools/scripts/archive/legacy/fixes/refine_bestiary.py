import json
import os
import re
import uuid

SRC_PACKS_BASE = "e:/AntigravitiProgetti/CompendioTheWitcher/../src-packs/witcher-monsters"
SRC_PACKS_CHAOS = "e:/AntigravitiProgetti/CompendioTheWitcher/../src-packs/witcher-monsters-chaos"
TEXTI_BASE = "e:/AntigravitiProgetti/CompendioTheWitcher/Tomo Base/Testi"
TEXTI_CHAOS = "e:/AntigravitiProgetti/CompendioTheWitcher/Tomo del Caos/Testi"

MAP_STATS = {
    "int": "int",
    "rif": "ref",
    "des": "dex",
    "fis": "body",
    "vel": "spd",
    "emp": "emp",
    "man": "cra",
    "vol": "will",
    "for": "luck"
}

def clean_html(text):
    if not text: return ""
    text = re.sub(r'Davide Mesina - \d+', '', text)
    text = re.sub(r'Alessandro Pacifico - \d+', '', text)
    text = re.sub(r'--- Pagina \d+ ---', '', text)
    return text.strip()

def extract_sidebar_stats(content):
    stats = {}
    patterns = {
        "int": r"INT (\d+)",
        "rif": r"RIF (\d+)",
        "des": r"DES (\d+)",
        "fis": r"FIS (\d+)",
        "vel": r"VEL (\d+)",
        "emp": r"EMP (\d+)",
        "man": r"MAN (\d+)",
        "vol": r"VOL (\d+)",
        "for": r"FOR (\d+)",
        "gri": r"GRI (\d+)",
        "ps": r"PS (\d+)",
        "ing": r"ING (\d+)",
        "rec": r"REC (\d+)",
        "vigore": r"VIGORE (\d+)"
    }
    for key, pat in patterns.items():
        m = re.search(pat, content)
        if m:
            stats[key] = int(m.group(1))
    return stats

def parse_capacities(content):
    # Find section "Capacità" or "Vulnerabilità"
    # Looking for lines like "NomeCapacità Descrizione..."
    capacities = []
    
    # Sections to scan
    sections = ["Vulnerabilità", "Capacità", "Immunità", "Resistenze"]
    for sec in sections:
        match = re.search(rf'{sec}\n([\s\S]+?)(?=\n[A-Z\s]+|--- Pagina|Bottino|Armi|$)', content)
        if match:
            lines = match.group(1).strip().split('\n')
            for line in lines:
                if len(line) < 5: continue
                # Split by first space if the first word is capitalized (Title)
                parts = re.match(r'^([A-Z][a-zàèìòù\']+\s?[A-Z]?[a-zàèìòù\']*) (.+)$', line.strip())
                if parts:
                    name = parts.group(1).strip()
                    desc = parts.group(2).strip()
                    capacities.append({
                        "name": f"[{sec}] {name}",
                        "desc": desc
                    })
                else:
                    # Just add as a whole if it doesn't match the Title Desc pattern
                    capacities.append({
                        "name": sec,
                        "desc": line.strip()
                    })
    return capacities

def process_monster(file_path, text_dir):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    monster_name = data["name"]
    # Manual bypass for Katakan as we manually fixed it
    if monster_name == "Katakan": return

    text_content = ""
    for f in os.listdir(text_dir):
        if monster_name.lower() in f.lower():
            with open(os.path.join(text_dir, f), 'r', encoding='utf-8') as tf:
                text_content = tf.read()
            break
            
    extracted_stats = extract_sidebar_stats(text_content)
    
    # 1. Remap Stats
    old_stats = data.get("system", {}).get("stats", {})
    is_empty = all(s.get("value", 0) == 0 for s in old_stats.values() if isinstance(s, dict))
    
    source_stats = extracted_stats if (is_empty and extracted_stats) else old_stats
    if not is_empty:
        for k, v in extracted_stats.items():
            if k in old_stats:
                if isinstance(old_stats[k], dict): old_stats[k]["value"] = v
                else: old_stats[k] = {"value": v}
            else:
                old_stats[k] = {"value": v}
        source_stats = old_stats

    new_stats = {}
    for old_key, new_key in MAP_STATS.items():
        val = 0
        if isinstance(source_stats.get(old_key), dict):
            val = source_stats[old_key].get("value", 0)
        elif isinstance(source_stats.get(old_key), int):
            val = source_stats[old_key]
        
        new_stats[new_key] = {"value": val, "max": val, "unmodifiedMax": val}
    
    if "fis" in source_stats:
        val = source_stats["fis"] if isinstance(source_stats["fis"], int) else source_stats["fis"].get("value", 0)
        new_stats["body"] = {"value": val, "max": val, "unmodifiedMax": val}

    # 2. Derived Stats
    body = new_stats.get("body", {}).get("value", 0)
    will = new_stats.get("will", {}).get("value", 0)
    base_max = (body + will) // 2
    
    def get_val(key, default=0):
        v = source_stats.get(key, default)
        return v if isinstance(v, int) else v.get("value", default)

    ps = get_val("ps")
    vigore = get_val("vigore")
    rec = get_val("rec")
    ing = get_val("ing")
    
    data["system"]["derivedStats"] = {
        "health": {"value": ps, "max": ps, "unmodifiedMax": ps},
        "stamina": {"value": vigore, "max": vigore, "unmodifiedMax": vigore},
        "vigor": {"value": vigore, "max": vigore, "unmodifiedMax": vigore},
        "rec": {"value": rec, "max": rec, "unmodifiedMax": rec},
        "resolve": {"value": ing, "max": ing, "unmodifiedMax": ing},
        "stun": {"value": min(max(base_max, 1), 10), "max": min(max(base_max, 1), 10)},
        "woundTreshold": {"value": base_max, "max": base_max}
    }
    
    data["system"]["stats"] = new_stats
    
    # 3. Special Capacities as Items
    if text_content:
        caps = parse_capacities(text_content)
        for c in caps:
            # Check if already exists
            if any(i["name"] == c["name"] for i in data["items"]): continue
            
            new_item = {
                "_id": uuid.uuid4().hex[:16],
                "name": c["name"],
                "type": "note",
                "img": "icons/svg/book.svg",
                "system": {
                    "description": f"<p>{c['desc']}</p>"
                },
                "effects": [],
                "folder": None,
                "sort": 0,
                "ownership": { "default": 0 },
                "flags": {},
                "_stats": { "systemId": "TheWitcherTRPG", "systemVersion": "1.0.0", "coreVersion": "13" }
            }
            data["items"].append(new_item)

    # 4. Clean biography
    if text_content:
        bio_match = re.search(r'--- Pagina \d+ ---([\s\S]+?)(Vulnerabilit|Capacit|ABILIT|Bottino)', text_content)
        if bio_match:
            data["system"]["details"]["biography"] = clean_html(bio_match.group(1)).replace('\n', '<br>')

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def main():
    if os.path.exists(SRC_PACKS_BASE):
        for f in os.listdir(SRC_PACKS_BASE):
            if f.endswith('.json'):
                process_monster(os.path.join(SRC_PACKS_BASE, f), TEXTI_BASE)
    
    if os.path.exists(SRC_PACKS_CHAOS):
        for f in os.listdir(SRC_PACKS_CHAOS):
            if f.endswith('.json'):
                process_monster(os.path.join(SRC_PACKS_CHAOS, f), TEXTI_CHAOS)

    print("Bestiary Refinement Complete.")

if __name__ == "__main__":
    main()

