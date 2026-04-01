import re
import json
import os

def parse_general_items(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    pages = re.split(r'--- Pagina \d+ ---', content)
    
    # 1. Extract potential item names and descriptions from pages 96-99
    # The descriptions are more reliable for names
    item_descriptions = {}
    for page in pages:
        # Descriptions start with Name at the beginning of a line followed by narrative
        # Using a list of known categories to avoid matching them as items
        categories = ["OGGETTI VARI", "SERVIZI", "CIBI E BEVANDE", "ALLOGGIO", "ABITI", "CONTENITORI", "RECIPIENTI", "UTENSILI"]
        
        lines = page.split('\n')
        for line in lines:
            line = line.strip()
            if not line or any(cat == line for cat in categories) or "---" in line:
                continue
            
            # Simple heuristic: "Name [Narrative text...]"
            # Narrative text starts with a capital letter and has many words
            match = re.search(r'^(.+?)\s+([A-Z\u00C0-\u017F].{20,})$', line)
            if match:
                name = match.group(1).strip()
                if name not in categories:
                    item_descriptions[name] = match.group(2).strip()

    # 2. Extract stats from the interleaved tables
    # Pattern: Name [Weight] Cost
    # Weight is usually float (e.g. 0,5 or 1 or 1,5)
    # Cost is int
    
    items_out = []
    
    # We'll scan all pages (especially page 95) for stat lines
    for page in pages:
        lines = page.split('\n')
        for line in lines:
            line = line.strip()
            # Try matching "Name Weight Cost"
            match_w = re.search(r'^(.+?)\s+([\d,.]+)\s+(\d+)$', line)
            # Try matching "Name Cost"
            match_c = re.search(r'^(.+?)\s+(\d+)$', line)
            
            name = ""
            weight = 0.0
            cost = 0
            
            if match_w:
                name = match_w.group(1).strip()
                weight_str = match_w.group(2).replace(',', '.')
                try:
                    weight = float(weight_str)
                    cost = int(match_w.group(3))
                except ValueError:
                    name = "" # backtrack
            
            if not name and match_c:
                name = match_c.group(1).strip()
                try:
                    cost = int(match_c.group(2))
                    weight = 0.0
                except ValueError:
                    name = ""

            if name and name in item_descriptions:
                items_out.append({
                    "name": name,
                    "weight": weight,
                    "cost": cost,
                    "description": item_descriptions[name],
                    "raw_line": line
                })
                # Remove from dict to avoid duplicates if name appears multiple times
                del item_descriptions[name]

    # Handle remaining descriptions that didn't have a simple stat line match
    # (Maybe due to multi-line names or complex stats)
    # For now, we'll just log them or do a fuzzy match
    
    return items_out

if __name__ == "__main__":
    base_path = r"e:\AntigravitiProgetti\CompendioTheWitcher\Tomo Base\Testi"
    items_file = os.path.join(base_path, "Pag095_Oggetti Vari.txt")
    
    if os.path.exists(items_file):
        data = parse_general_items(items_file)
        
        output_dir = "data"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        with open(os.path.join(output_dir, "raw_general_items.json"), "w", encoding="utf-8") as out:
            json.dump(data, out, indent=4, ensure_ascii=False)
        print(f"Parsed {len(data)} general items.")
    else:
        print("File not found.")
