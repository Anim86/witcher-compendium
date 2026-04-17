"""
Legge i file LevelDB delle cartelle packs e mostra tutti i record di razze e professioni.
Poi riscrive le cartelle con solo i record corretti (senza duplicati).
"""
import os
import re
import json

# Prova a usare la libreria leveldb se disponibile, altrimenti legge raw
try:
    import leveldb
    USE_LEVELDB = True
except ImportError:
    USE_LEVELDB = False

def read_ldb_raw(folder):
    """Legge i file .log e .ldb cercando record JSON."""
    records = []
    for fname in os.listdir(folder):
        fpath = os.path.join(folder, fname)
        if not os.path.isfile(fpath):
            continue
        if not (fname.endswith('.log') or fname.endswith('.ldb')):
            continue
        try:
            raw = open(fpath, 'rb').read()
            text = raw.decode('utf-8', errors='replace')
            # Cerca blocchi JSON che potrebbero essere record Foundry
            # I record sono preceduti da key (stringa) e poi il valore JSON
            for m in re.finditer(r'(\{"name"[^{}]*(?:\{[^{}]*\}[^{}]*)*\})', text):
                chunk = m.group(1)
                try:
                    obj = json.loads(chunk)
                    if 'name' in obj and 'type' in obj:
                        records.append({'_source': fname, '_data': obj})
                except:
                    pass
        except Exception as e:
            print(f"  Errore leggendo {fname}: {e}")
    return records

races_dir = 'e:/AntigravitiProgetti/CompendioTheWitcher/../../witcher-compendium/packs/witcher-races'
profs_dir = 'e:/AntigravitiProgetti/CompendioTheWitcher/../../witcher-compendium/packs/witcher-professions'

print("=== Contenuto LevelDB witcher-races ===")
print(f"File in cartella:")
for f in os.listdir(races_dir):
    fpath = os.path.join(races_dir, f)
    size = os.path.getsize(fpath) if os.path.isfile(fpath) else 0
    print(f"  {f} ({size} bytes)")

print()
print("=== Contenuto LevelDB witcher-professions ===")
print(f"File in cartella:")
for f in os.listdir(profs_dir):
    fpath = os.path.join(profs_dir, f)
    size = os.path.getsize(fpath) if os.path.isfile(fpath) else 0
    print(f"  {f} ({size} bytes)")

print()
print("=== Tentativo lettura raw razze ===")
races_records = read_ldb_raw(races_dir)
print(f"Record trovati: {len(races_records)}")
for r in races_records:
    print(f"  [{r['_source']}] {r['_data'].get('name','?')} | type={r['_data'].get('type','?')} | _id={r['_data'].get('_id','N/A')}")

print()
print("=== Tentativo lettura raw professioni ===")
profs_records = read_ldb_raw(profs_dir)
print(f"Record trovati: {len(profs_records)}")
for r in profs_records:
    print(f"  [{r['_source']}] {r['_data'].get('name','?')} | type={r['_data'].get('type','?')} | _id={r['_data'].get('_id','N/A')}")

