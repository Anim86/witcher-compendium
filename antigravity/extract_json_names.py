
import os
import json

dirs = [
    r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-monsters',
    r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-animals'
]

json_data = []

for d in dirs:
    for filename in os.listdir(d):
        if filename.endswith('.json'):
            path = os.path.join(d, filename)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    json_data.append({
                        "filename": filename,
                        "name": data.get("name", "Unknown"),
                        "dir": os.path.basename(d)
                    })
            except Exception as e:
                print(f"Error reading {filename}: {e}")

json_data.sort(key=lambda x: x["name"])

print("JSON Monster/Animal Names:")
for item in json_data:
    print(f"- {item['name']} (File: {item['filename']})")
