import os
import json
import glob

monsters_dir = r'e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\BESTIARIO\witcher-monsters'
output_file = r'e:\AntigravitiProgetti\CompendioTheWitcher\TO DO\report_mostri.md'

files = glob.glob(os.path.join(monsters_dir, '*.json'))

monsters = []

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            name = data.get('name', 'Sconosciuto')
            system = data.get('system', {})
            
            # Stats
            stats = system.get('stats', {})
            stats_present = any(s.get('value', 0) > 0 for s in stats.values() if isinstance(s, dict))
            
            # Derived
            derived = system.get('derivedStats', {})
            derived_present = any(s.get('value', 0) > 0 for s in derived.values() if isinstance(s, dict))
            
            # Skills
            skills = system.get('skills', {})
            skill_list = []
            for stat_key, stat_skills in skills.items():
                if isinstance(stat_skills, dict):
                    for sk_name, sk_data in stat_skills.items():
                        if isinstance(sk_data, dict) and sk_data.get('value', 0) > 0:
                            skill_list.append(f"{sk_name} ({sk_data.get('value')})")
            
            # Items
            items = data.get('items', [])
            weapons = []
            abilities = []
            for item in items:
                item_type = item.get('type')
                item_name = item.get('name', '')
                if item_type == 'weapon':
                    weapons.append(item_name)
                elif item_type == 'ability':
                    abilities.append(item_name)
            
            monsters.append({
                'name': name,
                'stats': '✅' if stats_present else '❌',
                'derived': '✅' if derived_present else '❌',
                'skills': len(skill_list),
                'weapons': ', '.join(weapons) if weapons else '-',
                'abilities': ', '.join(abilities) if abilities else '-'
            })
        except Exception as e:
            print(f"Error processing {file}: {e}")

monsters.sort(key=lambda x: x['name'])

with open(output_file, 'w', encoding='utf-8') as f:
    f.write('# Report Mostri\n\n')
    f.write('| Mostro | Statistiche | Stat Derivate | N° Abilità (Skills) | Armi/Attacchi | Capacità (Abilities) |\n')
    f.write('|---|---|---|---|---|---|\n')
    for m in monsters:
        f.write(f"| **{m['name']}** | {m['stats']} | {m['derived']} | {m['skills']} | {m['weapons']} | {m['abilities']} |\n")

print(f"Report generato in {output_file}")
