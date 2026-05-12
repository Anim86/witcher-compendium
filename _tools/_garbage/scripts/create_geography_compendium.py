import os
import json
import shutil

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_LORE = os.path.join(ROOT, "_tools", "src-packs", "LORE", "base", "witcher-lore")
SRC_GEO = os.path.join(ROOT, "_tools", "src-packs", "GEOGRAFIA", "base", "witcher-geografia")
MODULE_JSON = os.path.join(ROOT, "witcher-compendium", "module.json")

# Li identifico tramite categorie conosciute dalla fase precedente
GEO_ASSETS = [
    "attre.webp", "ebbing.webp", "gemmera.webp", "il_cuore_di_nilfgaard.webp",
    "nazair.webp", "skellige.webp", "verden.webp", "zerrikania.webp",
    "aedirn.webp", "dol_blathanna.webp", "kaedwen.webp", "mahakam.webp",
    "redania.webp", "temeria.webp", "cintra.webp", "kovir_e_poviss.webp"
]

def create_geography_pack():
    os.makedirs(SRC_GEO, exist_ok=True)
    moved_count = 0
    
    # 1. Sposta i JSON da Lore a Geografia in base all'asset img (o al category="regno")
    for filename in os.listdir(SRC_LORE):
        if filename.endswith(".json"):
            filepath = os.path.join(SRC_LORE, filename)
            try:
                with open(filepath, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                
                # Check se e' una regione/geografia
                is_geo = False
                category = data.get("system", {}).get("category", "")
                if category == "regno":
                    is_geo = True
                
                # O se l'immagine fa parte degli asset geografici
                img_path = data.get("img", "")
                for g_asset in GEO_ASSETS:
                    if g_asset in img_path:
                        is_geo = True
                        break
                        
                if is_geo:
                    # Move the file
                    destpath = os.path.join(SRC_GEO, filename)
                    shutil.move(filepath, destpath)
                    print(f"Moved JSON: {filename}")
                    moved_count += 1
            except Exception as e:
                print(f"Error reading {filename}: {e}")

    print(f"Moved {moved_count} JSONs to {SRC_GEO}")

    # 2. Registra in module.json
    try:
        with open(MODULE_JSON, 'r', encoding='utf-8') as f:
            mod_data = json.load(f)
            
        packs = mod_data.get("packs", [])
        
        # Controlla se witcher-geografia esiste gia
        exists = any(p["name"] == "witcher-geografia" for p in packs)
        if not exists:
            # Trova l'indice di witcher-lore per inserirlo li vicino
            lore_idx = next((i for i, p in enumerate(packs) if p["name"] == "witcher-lore"), -1)
            
            new_pack = {
                "name": "witcher-geografia",
                "label": "Geografia (Nazioni e Luoghi)",
                "path": "packs/GEOGRAFIA/base/witcher-geografia",
                "type": "Item",
                "system": "TheWitcherItaNewSystem"
            }
            
            if lore_idx != -1:
                packs.insert(lore_idx + 1, new_pack)
            else:
                packs.append(new_pack)
                
            mod_data["packs"] = packs
            
            with open(MODULE_JSON, 'w', encoding='utf-8') as f:
                json.dump(mod_data, f, indent=2, ensure_ascii=False)
            print("Registered 'witcher-geografia' in module.json")
        else:
            print("'witcher-geografia' is already registered in module.json")
            
    except Exception as e:
        print(f"Error updating module.json: {e}")

if __name__ == "__main__":
    create_geography_pack()
