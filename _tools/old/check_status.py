import json, glob, os

print('=== RAZZE (src-packs) ===')
for f in sorted(glob.glob('e:/AntigravitiProgetti/CompendioTheWitcher/../src-packs/witcher-races/*.json')):
    d = json.load(open(f, encoding='utf-8'))
    perks = [d['system'].get(f'perk{i}', {}).get('description', '') for i in range(1, 5)]
    has_desc = all(p and p != '-' for p in perks[:3])
    print(f"  {d['name']:10} | descrizioni={'OK' if has_desc else 'MANCANTI'}")

print()
print('=== PROFESSIONI (src-packs) ===')
for f in sorted(glob.glob('e:/AntigravitiProgetti/CompendioTheWitcher/../src-packs/witcher-professions/*.json')):
    d = json.load(open(f, encoding='utf-8'))
    has_def = bool(d['system'].get('definingSkill', {}).get('definition', ''))
    img = d.get('img', '')
    print(f"  {d['name']:12} | definition={'OK' if has_def else 'MANCANTE'} | img={'OK' if img else 'MANCANTE'}")

print()
print('=== DB compilati (packs/) ===')
for f in sorted(glob.glob('e:/AntigravitiProgetti/CompendioTheWitcher/../../witcher-compendium/packs/*.db')):
    size = os.path.getsize(f)
    print(f"  {os.path.basename(f):35} {size} bytes")

