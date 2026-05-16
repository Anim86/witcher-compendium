import os
import json

monsters_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-monsters"
zero_stat_monsters = []

for filename in os.listdir(monsters_dir):
    if filename.endswith(".json"):
        filepath = os.path.join(monsters_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                stats = data.get("system", {}).get("stats", {})
                
                # Check for zero stats
                is_zero = True
                for stat_name in ["intelligence", "reflexes", "dexterity", "body", "speed", "empathy", "craftsmanship", "willpower", "luck"]:
                    stat_obj = stats.get(stat_name, {})
                    val = stat_obj.get("value", 0) if isinstance(stat_obj, dict) else 0
                    if val != 0:
                        is_zero = False
                        break
                
                if is_zero:
                    zero_stat_monsters.append({"name": data.get("name", "Unknown"), "file": filename})
        except Exception as e:
            print(f"Error reading {filename}: {e}")

if zero_stat_monsters:
    print(f"Found {len(zero_stat_monsters)} monsters with zero stats:")
    for m in zero_stat_monsters:
        print(f"- {m['name']} ({m['file']})")
else:
    print("No monsters with zero stats found.")
