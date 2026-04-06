import os
import json

races_dir = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/src-packs/witcher-races'
print('Races Directory:')
for f in os.listdir(races_dir):
    print(f)
    if f.endswith('.json'):
        with open(os.path.join(races_dir, f), 'r', encoding='utf-8') as file:
            data = json.load(file)
            print(f"  -> name: {data.get('name')}, _id: {data.get('_id')}")

prof_dir = 'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/src-packs/witcher-professions'
print('\nProfessions Directory:')
for f in os.listdir(prof_dir):
    print(f)
    if f.endswith('.json'):
        with open(os.path.join(prof_dir, f), 'r', encoding='utf-8') as file:
            data = json.load(file)
            print(f"  -> name: {data.get('name')}, _id: {data.get('_id')}")
