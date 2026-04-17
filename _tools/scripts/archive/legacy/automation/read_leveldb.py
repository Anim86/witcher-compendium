import json
import struct
import os
import re

# Legge il file .log di LevelDB per trovare record Elfi/Witcher duplicati
items_dir = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'FoundryVTT', 'Data', 'worlds', 'test-witcher', 'data', 'items')

print(f"Leggo da: {items_dir}")
print()

found = []

for fname in os.listdir(items_dir):
    fpath = os.path.join(items_dir, fname)
    if not os.path.isfile(fpath):
        continue
    if not (fname.endswith('.log') or fname.endswith('.ldb')):
        continue
    
    try:
        raw = open(fpath, 'rb').read()
        # Cerca pattern JSON con "name":"Elfi" o "Witcher" o "Armigero"
        text = raw.decode('utf-8', errors='replace')
        # Cerca sottostringhe JSON
        for m in re.finditer(r'\{[^\x00]*?"type"\s*:\s*"(race|profession)"[^\x00]*?\}', text):
            chunk = m.group(0)
            # Estrai name e _id
            name_m = re.search(r'"name"\s*:\s*"([^"]+)"', chunk)
            id_m = re.search(r'"_id"\s*:\s*"([^"]+)"', chunk)
            if name_m:
                entry = {
                    'file': fname,
                    'name': name_m.group(1),
                    '_id': id_m.group(1) if id_m else 'N/A',
                    'type': m.group(1)
                }
                found.append(entry)
                print(f"  [{fname}] {entry['type']}: {entry['name']} | _id={entry['_id']}")
    except Exception as e:
        print(f"  Errore su {fname}: {e}")

print()
print(f"Totale trovati: {len(found)}")

# Raggruppa per nome per vedere duplicati
from collections import Counter
names = Counter(e['name'] for e in found)
print("\nConteggio per nome:")
for name, count in names.most_common():
    marker = " <-- DUPLICATO!" if count > 1 else ""
    print(f"  {name}: {count}{marker}")
