"""
Legge file .log LevelDB in modalità raw e cerca stringhe JSON.
LevelDB .log usa un formato con blocchi binari + payload testuale.
"""
import os
import struct
import json
import re

def extract_strings_from_log(filepath):
    """Estrae tutte le stringhe leggibili da un file .log LevelDB."""
    results = []
    try:
        with open(filepath, 'rb') as f:
            data = f.read()
        
        # Cerca JSON objects nel file binario
        # Foundry salva i record come: key\x00value_json
        text = data.decode('utf-8', errors='replace')
        
        # Cerca tutti i blocchi che sembrano record Foundry
        # Formato tipico: {"_id":"...","name":"...","type":"..."}
        pattern = r'\{"[^"]+":"[^"]*"(?:,"[^"]+":(?:"[^"]*"|\d+|true|false|null|\{[^}]*\}|\[[^\]]*\]))*\}'
        for m in re.finditer(r'\{[^\x00\x01\x02\x03\x04\x05\x06\x07\x08\x0b\x0c\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f]*?"name"[^\x00]*?"type"[^\x00]*?\}', text):
            chunk = m.group(0)
            # Verifica che sia JSON valido
            brace_count = 0
            start = chunk.find('{')
            if start == -1:
                continue
            for i, c in enumerate(chunk):
                if c == '{':
                    brace_count += 1
                elif c == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        json_str = chunk[start:i+1]
                        try:
                            obj = json.loads(json_str)
                            if 'name' in obj and 'type' in obj and obj.get('type') in ('race', 'profession'):
                                results.append(obj)
                        except:
                            pass
                        break
    except Exception as e:
        print(f"  Errore: {e}")
    return results

# Controlla le cartelle LevelDB delle razze e professioni
packs_dir = 'e:/AntigravitiProgetti/CompendioTheWitcher/../../witcher-compendium/packs'

for pack_name in ['witcher-races', 'witcher-professions']:
    pack_dir = os.path.join(packs_dir, pack_name)
    db_file = os.path.join(packs_dir, f'{pack_name}.db')
    
    print(f"\n=== {pack_name} ===")
    
    # Leggi il .db (flat)
    print(f"\n-- File .db flat ({db_file}) --")
    if os.path.exists(db_file):
        with open(db_file, encoding='utf-8') as f:
            lines = [l.strip() for l in f if l.strip()]
        print(f"  Record nel .db: {len(lines)}")
        for line in lines:
            try:
                obj = json.loads(line)
                print(f"  > {obj.get('name')} | _id={obj.get('_id')}")
            except:
                pass
    else:
        print("  FILE NON TROVATO")
    
    # Leggi le LevelDB
    print(f"\n-- Cartella LevelDB ({pack_dir}) --")
    if os.path.exists(pack_dir):
        all_found = []
        for fname in sorted(os.listdir(pack_dir)):
            fpath = os.path.join(pack_dir, fname)
            if fname.endswith('.log') or fname.endswith('.ldb'):
                found = extract_strings_from_log(fpath)
                if found:
                    for obj in found:
                        print(f"  [{fname}] {obj.get('name')} | _id={obj.get('_id')}")
                        all_found.append(obj)
        if not all_found:
            print("  Nessun record trovato (o formato non leggibile)")
        print(f"  Totale record LevelDB: {len(all_found)}")
    else:
        print("  CARTELLA NON ESISTE (buono!)")

