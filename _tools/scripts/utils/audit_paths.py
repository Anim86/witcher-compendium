import os
import json
import re

# Resolve paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../"))
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")
REPORT_PATH = os.path.join(ROOT, "_tools", "reports", "audit-percorsi-immagini.md")

def get_all_assets():
    """Builds a map of all files in assets/ directory for fuzzy matching."""
    asset_map = {} # filename.lower() -> [absolute_paths]
    for root, dirs, files in os.walk(ASSETS_DIR):
        for f in files:
            lower_name = f.lower()
            if lower_name not in asset_map:
                asset_map[lower_name] = []
            asset_map[lower_name].append(os.path.join(root, f))
    return asset_map

def audit_paths():
    asset_map = get_all_assets()
    broken_links = []
    casing_issues = []
    prefix_suggestions = []
    
    print(f"SEARCH Avvio audit su {SRC_PACKS}...")

    total_checked = 0
    for root, dirs, files in os.walk(SRC_PACKS):
        for file in files:
            if not file.endswith(".json"): continue
            
            fpath = os.path.join(root, file)
            total_checked += 1
            
            try:
                with open(fpath, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                
                img_path = data.get("img", "")
                if not isinstance(img_path, str) or not img_path: continue
                
                # Foundry paths usually start with 'modules/witcher-compendium/'
                # We need to map this to our local ASSETS_DIR
                local_rel_path = img_path.replace("modules/witcher-compendium/", "")
                local_abs_path = os.path.join(ROOT, "witcher-compendium", local_rel_path.replace("/", os.sep))
                
                # 1. Check if path exists exactly
                if not os.path.exists(local_abs_path):
                    filename = os.path.basename(local_rel_path)
                    lower_filename = filename.lower()
                    
                    found = False
                    
                    # 2. Check for Casing issues in the SAME directory
                    dir_name = os.path.dirname(local_abs_path)
                    if os.path.exists(dir_name):
                        for item in os.listdir(dir_name):
                            if item.lower() == lower_filename:
                                casing_issues.append({
                                    "json": os.path.relpath(fpath, ROOT),
                                    "expected": img_path,
                                    "actual_file": item
                                })
                                found = True
                                break
                    
                    if found: continue

                    # 3. Check for Prefixes (Maledizione_, Ferita_, etc.)
                    # If JSON says 'licantropia.webp' and we find 'Maledizione_licantropia.webp'
                    prefixes = ["Maledizione_", "Ferita_", "Tratto_", "Abilita_"]
                    for prefix in prefixes:
                        prefixed_name = (prefix + filename).lower()
                        if prefixed_name in asset_map:
                            prefix_suggestions.append({
                                "json": os.path.relpath(fpath, ROOT),
                                "expected": img_path,
                                "suggested": asset_map[prefixed_name][0]
                            })
                            found = True
                            break
                    
                    if found: continue

                    # 4. Global Fuzzy Match
                    if lower_filename in asset_map:
                        broken_links.append({
                            "json": os.path.relpath(fpath, ROOT),
                            "expected": img_path,
                            "found_at": [os.path.relpath(p, ROOT) for p in asset_map[lower_filename]]
                        })
                    else:
                        # Truly missing
                        broken_links.append({
                            "json": os.path.relpath(fpath, ROOT),
                            "expected": img_path,
                            "found_at": None
                        })

            except Exception as e:
                print(f"❌ Errore in {file}: {e}")

    # Generate Report
    with open(REPORT_PATH, 'w', encoding='utf-8') as r:
        r.write("# 📂 Audit Percorsi Immagini\n\n")
        r.write(f"Data Esecuzione: {os.popen('date /t').read().strip()} {os.popen('time /t').read().strip()}\n")
        r.write(f"Voci controllate: {total_checked}\n\n")
        
        r.write("## ⚠️ Discrepanze di Maiuscole/Minuscole (Casing)\n")
        if not casing_issues: r.write("Nessun problema rilevato.\n")
        for item in casing_issues:
            r.write(f"- **JSON**: `{item['json']}`\n  - Richiesto: `{item['expected']}`\n  - Esiste: `{item['actual_file']}`\n\n")

        r.write("\n## 🔄 Suggerimenti Prefissi (es. Maledizione_)\n")
        if not prefix_suggestions: r.write("Nessun suggerimento.\n")
        for item in prefix_suggestions:
            r.write(f"- **JSON**: `{item['json']}`\n  - Manca: `{item['expected']}`\n  - Trovato con prefisso: `{os.path.basename(item['suggested'])}`\n\n")

        r.write("\n## ❌ Link Rotti o Spostati\n")
        missing_count = 0
        moved_count = 0
        for item in broken_links:
            if item['found_at']:
                moved_count += 1
                r.write(f"- **SPOSTATO**: `{item['json']}`\n  - Target: `{item['expected']}`\n  - Trovato in: `{item['found_at'][0]}`\n\n")
            else:
                missing_count += 1
                
        r.write(f"\n### 📝 Riepilogo Link Rotti\n")
        r.write(f"- File trovati in altre cartelle: {moved_count}\n")
        r.write(f"- File totalmente mancanti: {missing_count}\n")

    print(f"✅ Audit completato. Report generato in: {REPORT_PATH}")

if __name__ == "__main__":
    audit_paths()
