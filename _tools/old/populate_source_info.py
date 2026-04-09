import json
import os
import re

# Paths
SRC_ROOT = "../src-packs"
BOOKS = {
    "Tomo del Caos/Testi": "TC",
    "Tomo Base/Testi": "MB"
}

def normalize_name(name):
    # Remove parenthetical info: "Banchetto dell'Abbondanza (Dana Meadbh)" -> "Banchetto dell'Abbondanza"
    base_name = re.sub(r'\s*\(.*?\)', '', name).strip()
    return base_name.lower().replace('’', "'").replace('‘', "'")

def main():
    modified_count = 0
    total_count = 0
    skipped_list = []
    
    # 1. Load All Source Text with Page Awareness
    source_data = {}
    for folder, book_code in BOOKS.items():
        source_data[book_code] = {}
        if not os.path.exists(folder): continue
        for file in os.listdir(folder):
            if not file.endswith('.txt'): continue
            with open(os.path.join(folder, file), 'r', encoding='utf-8') as f:
                content = f.read().replace('’', "'").replace('‘', "'")
                parts = re.split(r'--- Pagina (\d+) ---', content)
                for i in range(1, len(parts), 2):
                    p_num = parts[i]
                    p_text = parts[i+1]
                    if p_num not in source_data[book_code]:
                        source_data[book_code][p_num] = ""
                    source_data[book_code][p_num] += p_text + "\n"

    # 2. Iterate through JSON files
    for root, dirs, files in os.walk(SRC_ROOT):
        for file in files:
            if not file.endswith('.json'): continue
            path = os.path.join(root, file)
            total_count += 1
            
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            name = data.get("name", "")
            norm_name = normalize_name(name)
            system = data.get("system", {})
            
            # Skip if already has a source set in this run? No, we might want to fix it.
            
            found_source = None
            preferred_book = "TC" if "-chaos" in root.lower() else "MB"
            other_book = "MB" if preferred_book == "TC" else "TC"
            
            for book in [preferred_book, other_book]:
                if found_source: break
                for p_num, p_text in source_data[book].items():
                    # Check if norm_name is in p_text (anchor it to start of word)
                    # We look for "[Name]" at the start of a line OR near specific headers
                    search_pattern = rf"(?:^|\n|\r)\s*{re.escape(norm_name)}(?:\s|:|$|\()"
                    if re.search(search_pattern, p_text.lower()):
                        found_source = f"{book} {p_num}"
                        break
            
            if found_source:
                system["sourcebook"] = found_source
                if data.get("type") in ["spell", "ritual", "alchemical"]:
                    system["source"] = found_source
                data["system"] = system
                with open(path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                modified_count += 1
            else:
                skipped_list.append(f"{data.get('type')}: {name}")

    print(f"Source Field Population (v1.0.4 - FUZZY PASS):")
    print(f"Entries Updated: {modified_count}")
    print(f"Skipped: {len(skipped_list)}")
    print(f"Total: {total_count}")
    
    with open("audit-source-skipped-1.0.4.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(skipped_list))

if __name__ == "__main__":
    main()

