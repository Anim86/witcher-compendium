import os
import json

monsters_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-monsters"
zero_stat_monsters = []

for filename in os.listdir(monsters_dir):
    if filename.endswith(".json"):
        filepath = os.path.join(monsters_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            stats = data.get("system", {}).get("stats", {})
            
            # Check for zero stats (INT, RIF, DES, etc.)
            is_zero = True
            for stat_name in ["intelligence", "reflexes", "dexterity", "body", "speed", "empathy", "craftsmanship", "willpower", "luck"]:
                val = stats.get(stat_name, {}).get("value", 0)
                if val != 0:
                    is_zero = False
                    break
            
            if is_zero:
                name = data.get("name", "Unknown")
                zero_stat_monsters.append({"name": name, "file": filename})

print(json.dumps(zero_stat_monsters, indent=2))
