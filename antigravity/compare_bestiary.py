
import re
import os
import json
import sys

# Set encoding to utf-8 for stdout
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

# XML Extraction
xml_path = r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\raw-data\Bestiario.xml'
with open(xml_path, 'r', encoding='utf-8') as f:
    content = f.read()

monster_blocks = re.findall(r'<SchedaMostro>(.*?)</SchedaMostro>', content, re.DOTALL)
xml_names = set()
for block in monster_blocks:
    name_match = re.search(r'<Nome>(.*?)</Nome>', block)
    if name_match:
        xml_names.add(name_match.group(1))

# JSON Extraction
dirs = [
    r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-monsters',
    r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-animals'
]

json_names_map = {} # Name -> Filename
for d in dirs:
    for filename in os.listdir(d):
        if filename.endswith('.json'):
            path = os.path.join(d, filename)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    name = data.get("name", "Unknown")
                    json_names_map[name] = filename
            except:
                pass

# Comparison
all_names = sorted(list(xml_names | set(json_names_map.keys())))

print("| Nome | In XML | In JSON | File JSON Corrispondente | Stato |")
print("| :--- | :---: | :---: | :--- | :--- |")

for name in all_names:
    in_xml = "SI" if name in xml_names else "NO"
    in_json = "SI" if name in json_names_map else "NO"
    filename = json_names_map.get(name, "-")
    
    # Simple matching logic for partial matches
    status = "OK"
    if in_xml == "SI" and in_json == "NO":
        # Check if there's a partial match in JSON names
        for jname in json_names_map.keys():
            if name.lower() in jname.lower() or jname.lower() in name.lower():
                status = f"Possibile Match: {jname}"
                break
        else:
            status = "Nuovo (Solo XML)"
    elif in_xml == "NO" and in_json == "SI":
        status = "Legacy (Solo JSON)"
    
    print(f"| {name} | {in_xml} | {in_json} | {filename} | {status} |")
