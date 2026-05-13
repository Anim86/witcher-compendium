import os
import json

monsters_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-monsters"
stats_status = []

for filename in os.listdir(monsters_dir):
    if filename.endswith(".json"):
        filepath = os.path.join(monsters_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                stats = data.get("system", {}).get("stats", {})
                
                # Check for zero stats
                is_zero = True
                for stat_name in ["int", "ref", "dex", "body", "spd", "emp", "cra", "will", "luck"]:
                    stat_obj = stats.get(stat_name, {})
                    val = stat_obj.get("value", 0) if isinstance(stat_obj, dict) else 0
                    if val != 0:
                        is_zero = False
                        break
                
                stats_status.append({
                    "name": data.get("name", "Unknown"),
                    "file": filename,
                    "has_stats": not is_zero,
                    "source": data.get("system", {}).get("sourcebook", "N/A")
                })
        except Exception as e:
            print(f"Error reading {filename}: {e}")

# Save the status report
with open("monster_stats_status.json", "w", encoding="utf-8") as f:
    json.dump(stats_status, f, indent=4)

zero_count = len([m for m in stats_status if not m["has_stats"]])
total_count = len(stats_status)
print(f"Total Monsters: {total_count}")
print(f"Monsters with zero stats: {zero_count}")
print(f"Monsters with stats: {total_count - zero_count}")
