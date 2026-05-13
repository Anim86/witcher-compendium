import os
import json

def normalize_monster(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Force type to monster
    data['type'] = 'monster'
    
    system = data.get('system', {})
    details = system.get('details', {})
    
    # 1. Promote header fields to system root
    fields_to_promote = [
        'monsterType', 'difficulty', 'size', 'intelligence', 
        'bounty', 'senses', 'regeneration', 'height', 'weight', 'environment', 'organization',
        'academicKnowledge', 'common', 'monsterLore', 'vulnerability', 'resistances', 'immunities', 'susceptibilities'
    ]
    
    for field in fields_to_promote:
        if field in details:
            system[field] = details[field]
        if field in system and field not in details:
            details[field] = system[field]

    # 2. Handle Armor (Stopping Power)
    if 'stats' not in system:
        system['stats'] = {}
    
    if 'armor' not in system['stats']:
        system['stats']['armor'] = {"value": 0, "max": 0}
    
    sp = system.get('armorUpper', system.get('armorHead', 0))
    try:
        sp_int = int(sp)
    except:
        sp_int = 0
        
    system['stats']['armor']['value'] = sp_int
    system['stats']['armor']['max'] = sp_int

    # 3. Ensure Focus exists
    if 'derivedStats' not in system:
        system['derivedStats'] = {}
    
    if 'focus' not in system['derivedStats']:
        luck_val = system.get('stats', {}).get('luck', {}).get('value', 0)
        system['derivedStats']['focus'] = {"value": luck_val, "max": luck_val, "unmodifiedMax": luck_val}

    # 4. Clean up items and convert notes to abilities
    if 'items' in data:
        for item in data['items']:
            item_system = item.get('system', {})
            item_system['isStored'] = False
            
            # Convert note to ability if it has [Capacità] or similar
            if item.get('type') == 'note' or (item.get('type') == 'valuable' and '[Capacità]' in item.get('name', '')):
                item['type'] = 'ability'
            
            # Weapon specific fixes
            if item.get('type') == 'weapon':
                if 'damage' not in item_system or not item_system['damage']:
                    item_system['damage'] = "N/A"
                if 'reliable' not in item_system:
                    item_system['reliable'] = 0
                if 'rateOfFire' not in item_system:
                    item_system['rateOfFire'] = 1
            
            item['system'] = item_system

    # 5. Ensure skill groups
    if 'skills' not in system:
        system['skills'] = {}
    
    skill_groups = ['int', 'ref', 'dex', 'body', 'emp', 'cra', 'will']
    for group in skill_groups:
        if group not in system['skills']:
            system['skills'][group] = {}

    data['system'] = system
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def main():
    paths = [
        r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-monsters',
        r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-animals'
    ]
    
    for base_path in paths:
        if not os.path.exists(base_path):
            continue
        print(f"Processing {base_path}...")
        for filename in os.listdir(base_path):
            if filename.endswith('.json'):
                normalize_monster(os.path.join(base_path, filename))
    print("Normalization complete.")

if __name__ == "__main__":
    main()
