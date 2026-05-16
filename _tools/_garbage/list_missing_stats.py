
import json

with open(r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\scratch\monster_stats_status.json', 'r') as f:
    data = json.load(f)

missing = [m for m in data if not m['has_stats']]
for m in missing:
    print(f"{m['name']} - Source: {m['source']}")
