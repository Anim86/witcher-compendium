import json
import os
import re

# Paths
SRC_ROOT = "witcher-compendium/src-packs"
TXT_DIRS = [
    "Tomo del Caos/Testi",
    "Tomo Base/Testi"
]

def load_txt_sources():
    full_text = ""
    for txt_dir in TXT_DIRS:
        if not os.path.exists(txt_dir): continue
        for file in os.listdir(txt_dir):
            if file.endswith('.txt'):
                with open(os.path.join(txt_dir, file), 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Normalize smart quotes to standard quotes in SOURCE
                    content = content.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
                    full_text += content + "\n\n"
    return full_text

def normalize_name(name):
    # Remove the (Type) part for matching
    base_name = re.sub(r'\s*\(.*?\)', '', name).strip()
    return base_name.replace('’', "'").replace('‘', "'")

def clean_html(text):
    if not text: return ""
    # Remove OCR artifacts like line breaks in the middle of words
    text = text.replace('-\n', '').replace('- ', '')
    text = text.replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text)
    return f"<p>{text.strip()}</p>"

def extract_spell_effect(name, search_text):
    base_name = normalize_name(name)
    
    # Anchor 1: [Name] (Optional type) Costo in RES:
    # Example: Aard (Aria) Costo in RES: Variabile
    # Example: Immobilizzare Lingua Costo in RES: 5
    pattern = rf"{re.escape(base_name)}(?:\s+\(.*?\))?\s+Costo in RES:\s*(?:\d+|variabile|Variabile)\s+Effetto:\s*(.*?)(?=\s*(Portata:|Durata:|Tempo di Preparazione:|Difficoltà della Prova:|Difese:|Componenti:|--- Pagina|$))"
    match = re.search(pattern, search_text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()

    # Anchor 2: Fallback for different spell layouts
    pattern_alt = rf"{re.escape(base_name)}.*?Effetto:\s*(.*?)(?=\s*(Portata:|Durata:|Tempo di Preparazione:|Difficoltà della Prova:|Difese:|Componenti:|--- Pagina|$))"
    match = re.search(pattern_alt, search_text, re.DOTALL | re.IGNORECASE)
    if match:
        desc = match.group(1).strip()
        if len(desc) > 20 and "Costo in RES" not in desc[:100]:
            return desc

    return None

def extract_monster_lore(name, search_text):
    base_name = normalize_name(name)
    # Search for Lore section. Monsters often have [NAME] then some stats, then CONOSCENZA...
    pattern = rf"{re.escape(base_name)}.*?CONOSCENZA E COMPORTAMENTO\s*\(BESTIARIO CD\s*\d+\)\s*(.*?)(?=\s*(Attacchi|Capacità|Bottino|Davide Mesina|— Rodolf Kazmer|--- Pagina|$))"
    match = re.search(pattern, search_text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None

def extract_gear_description(name, search_text):
    base_name = normalize_name(name)
    # Gear: [Name] [Description] -Rodolf Kazmer
    # We must ensure the name is at the START of a block or line to avoid random mentions
    pattern = rf"(?:^|\n){re.escape(base_name)}\s+(.*?)(?=\s*(-Rodolf Kazmer|- Rodolf Kazmer|- Glynnis var Treharne|Alessandro Pacifico|--- Pagina|$))"
    match = re.search(pattern, search_text, re.DOTALL)
    if match:
        desc = match.group(1).strip()
        if len(desc) > 15 and "Costo in RES" not in desc:
            return desc
    return None

def main():
    source_text = load_txt_sources()
    modified_count = 0
    total_count = 0
    skipped_list = []

    for root, dirs, files in os.walk(SRC_ROOT):
        for file in files:
            if not file.endswith('.json'): continue
            path = os.path.join(root, file)
            total_count += 1
            
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            name = data.get("name", "")
            doc_type = data.get("type", "")
            system = data.get("system", {})
            found_text = None

            # 1. Spells / Rituals / Alchemy
            if doc_type in ["spell", "ritual", "alchemical", "hex"]:
                found_text = extract_spell_effect(name, source_text)
                if found_text:
                    system["effect"] = clean_html(found_text)
            
            # 2. Monsters
            elif doc_type == "monster" or data.get("documentName") == "Actor":
                found_text = extract_monster_lore(name, source_text)
                if found_text:
                    if "notes" not in system: system["notes"] = []
                    system["notes"] = [{"title": "Descrizione", "details": clean_html(found_text)}]
            
            # 3. Gear / Others
            else:
                found_text = extract_gear_description(name, source_text)
                if found_text:
                    system["description"] = clean_html(found_text)

            if found_text:
                modified_count += 1
                data["system"] = system
                with open(path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
            else:
                # If we couldn't restore, we MUST clear the generic/incorrect text from previous failed runs
                # But only if it's suspicious (e.g. contains names of many items)
                pass

    print(f"Content Restoration (v1.0.3 - Final pass):")
    print(f"Correctly Matched & Restored: {modified_count}")
    print(f"Total Entries Processed: {total_count}")

if __name__ == "__main__":
    main()
