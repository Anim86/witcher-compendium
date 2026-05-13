
import re

xml_path = r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\raw-data\Bestiario.xml'
with open(xml_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all SchedaMostro blocks
monster_blocks = re.findall(r'<SchedaMostro>(.*?)</SchedaMostro>', content, re.DOTALL)

monster_names = []
for block in monster_blocks:
    # Find the FIRST <Nome> in the block (which should be the monster's name)
    name_match = re.search(r'<Nome>(.*?)</Nome>', block)
    if name_match:
        monster_names.append(name_match.group(1))

monster_names = sorted(list(set(monster_names)))

print("XML Monster Names:")
for name in monster_names:
    print(f"- {name}")
