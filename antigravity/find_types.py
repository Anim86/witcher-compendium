import os
import json
from collections import Counter

root_dir = r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'
types = Counter()

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.json'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if 'type' in data:
                        types[data['type']] += 1
            except Exception as e:
                pass

print(json.dumps(dict(types), indent=2))
