import os
import json

# Paths to update
paths = [
    r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\EQUIPAGGIAMENTO\base\witcher-special",
    r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\EQUIPAGGIAMENTO\caos\witcher-special-chaos"
]

# Destination mapping (Assets will be generated tomorrow)
# We use the correct intended prefix modules/witcher-compendium/assets/EQUIPAGGIAMENTO/...
# To keep it organized, let's put them in base/witcher-special for all (as they are unique assets)

prefix_special = "modules/witcher-compendium/assets/EQUIPAGGIAMENTO/base/witcher-special/"

mappings = {
    "Anti-": "Witcher_Unguento.webp",
    "Decotto": "Witcher_Decotto.webp",
    "Pozione": "Witcher_Pozione.webp",
    "Bufera": "Witcher_Pozione.webp",
    "Rondine": "Witcher_Pozione.webp",
    "Gatto": "Witcher_Pozione.webp",
    "Tuono": "Witcher_Pozione.webp",
    "Fulmine": "Witcher_Pozione.webp",
    "Spada d'argento": "Spada_Argento_Witcher.webp",
    "Spada d'acciaio": "Spada_Acciaio_Witcher.webp",
    "Medaglione": "Medaglione_Witcher.webp",
    "Runa": "Runa_Witcher.webp"
}

updated_count = 0
for d in paths:
    if os.path.exists(d):
        for filename in os.listdir(d):
            if filename.endswith(".json"):
                fpath = os.path.join(d, filename)
                with open(fpath, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                
                name = data.get("name", "")
                best_match = None
                
                for key, asset_name in mappings.items():
                    if key.lower() in name.lower():
                        best_match = asset_name
                        break
                
                if best_match:
                    data["img"] = f"{prefix_special}{best_match}"
                    with open(fpath, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=4, ensure_ascii=False)
                    updated_count += 1

print(f"Updated {updated_count} Special/Chaos items to future asset paths.")
