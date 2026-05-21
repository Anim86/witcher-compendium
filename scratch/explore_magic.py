import os
import json

base_dir = r"e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\MAGIA_E_MALEDIZIONI"

results = []

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.json'):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                name = data.get("name", "Unknown")
                item_type = data.get("type", "Unknown")
                rel_path = os.path.relpath(file_path, base_dir)
                results.append({
                    "name": name,
                    "type": item_type,
                    "rel_path": rel_path,
                    "file": file
                })
            except Exception as e:
                print(f"Error reading {file_path}: {e}")

print(f"Found {len(results)} assets.")
# Print some stats and first few results
for r in results[:10]:
    print(r)

# Save results to a json file to read easily
with open(r"e:\AntigravitiProgetti\CompendioTheWitcher\scratch\magic_assets.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=4, ensure_ascii=False)
