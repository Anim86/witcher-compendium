import os
import json
import re

weapon_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\EQUIPAGGIAMENTO\witcher-weapons"

skills_map = {
    "archery": ["ARCO", "ZEFHAR", "BOW"],
    "crossbow": ["BALESTRA", "CROSSBOW"],
    "smallblades": ["PUGNALE", "STILETTO", "DAGGER"],
    "staffspear": ["LANCIA", "ALABARDA", "PARTIGIANA", "PICCA", "SPEAR", "HALBERD"],
    "brawling": ["TIRAPUGNI", "BRACCIO", "MANI", "HANDS"],
    "swordsmanship": ["SPADA", "MESSER", "TORRWR", "SWORD"],
    "melee": ["MAZZA", "MARTELLO", "ASCIA", "MAZZAPICCHIO", "FLAIL", "MAZZAFRUSTO", "AXE", "MACE", "HAMMER", "SPEZZALAMA", "PALA", "TORCIA"]
}

ranged_skills = ["archery", "crossbow"]

count = 0
for filename in os.listdir(weapon_dir):
    if not filename.endswith(".json"):
        continue
    
    filepath = os.path.join(weapon_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Error reading {filename}: {e}")
            continue

    if data.get("type") != "weapon":
        continue

    name = data.get("name", "").upper()
    system = data.get("system", {})
    
    found_skill = None
    is_ranged = False
    
    for skill, keywords in skills_map.items():
        if any(kw in name for kw in keywords):
            found_skill = skill
            if skill in ranged_skills:
                is_ranged = True
            break
    
    if found_skill:
        changed = False
        if is_ranged:
            if system.get("rangedAttackSkill") != found_skill:
                system["rangedAttackSkill"] = found_skill
                changed = True
            # For ranged, we might want to ensure attackOptions has 'ranged'
            options = system.get("attackOptions", [])
            if 'ranged' not in options:
                options.append('ranged')
                system["attackOptions"] = options
                changed = True
        else:
            if system.get("meleeAttackSkill") != found_skill:
                system["meleeAttackSkill"] = found_skill
                changed = True
            options = system.get("attackOptions", [])
            if 'melee' not in options:
                options.append('melee')
                system["attackOptions"] = options
                changed = True
        
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            count += 1
            print(f"Updated {filename} with skill {found_skill}")

print(f"Total updated: {count}")
