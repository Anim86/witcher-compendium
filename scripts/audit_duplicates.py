import json
import os
import glob

races_db = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/packs/witcher-races.db'
profs_db = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/packs/witcher-professions.db'

print('=== RAZZE nel DB ===')
if os.path.exists(races_db):
    for line in open(races_db, encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        d = json.loads(line)
        print(f"  {d['name']} | _id: {d.get('_id','N/A')}")
else:
    print('FILE NON ESISTE:', races_db)

print()
print('=== PROFESSIONI nel DB ===')
if os.path.exists(profs_db):
    for line in open(profs_db, encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        d = json.loads(line)
        print(f"  {d['name']} | _id: {d.get('_id','N/A')}")
else:
    print('FILE NON ESISTE:', profs_db)

print()
print('=== FILE SORGENTE RAZZE ===')
src_races = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/src-packs/witcher-races'
if os.path.exists(src_races):
    for f in sorted(glob.glob(src_races + '/*.json')):
        d = json.load(open(f, encoding='utf-8'))
        print(f"  {os.path.basename(f)} -> name={d['name']} | _id={d.get('_id','N/A')}")
else:
    print('DIR NON ESISTE:', src_races)

print()
print('=== FILE SORGENTE PROFESSIONI ===')
src_profs = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/src-packs/witcher-professions'
if os.path.exists(src_profs):
    for f in sorted(glob.glob(src_profs + '/*.json')):
        d = json.load(open(f, encoding='utf-8'))
        print(f"  {os.path.basename(f)} -> name={d['name']} | _id={d.get('_id','N/A')}")
else:
    print('DIR NON ESISTE:', src_profs)

print()
print('=== LISTA TUTTE LE PACKS DIR ===')
packs_dir = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/packs'
for item in sorted(os.listdir(packs_dir)):
    full = os.path.join(packs_dir, item)
    if os.path.isfile(full):
        print(f"  FILE: {item}")
    else:
        print(f"  DIR:  {item}/")
