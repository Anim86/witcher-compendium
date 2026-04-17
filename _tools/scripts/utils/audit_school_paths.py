import os
import json

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACKS_ARMI = os.path.join(ROOT, "_tools", "src-packs", "EQUIPAGGIAMENTO_E_TRASPORTI", "Armi_e_Armature")
SEARCH_TERMS = ["vipera", "orso", "gatto", "grifone", "lupo", "manticora"]

def audit_school_weapons():
    found_items = []
    for root, dirs, files in os.walk(SRC_PACKS_ARMI):
        for f in files:
            if f.endswith(".json"):
                path = os.path.join(root, f)
                if any(term in f.lower() for term in SEARCH_TERMS):
                    with open(path, 'r', encoding='utf-8') as jf:
                        try:
                            data = json.load(jf)
                            img = data.get("img", "")
                            name = data.get("name", "")
                            found_items.append({
                                "name": name,
                                "path": path,
                                "img": img
                            })
                        except:
                            pass
    return found_items

if __name__ == "__main__":
    items = audit_school_weapons()
    for item in items:
        print(f"Name: {item['name']}")
        print(f"JSON: {item['path']}")
        print(f"IMG:  {item['img']}")
        print("-" * 30)
