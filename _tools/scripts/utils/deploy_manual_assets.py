import os
import json
from PIL import Image

# Configurazione percorsi
ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
TEMP_DIR = os.path.join(ROOT, "temp_images")
ASSETS_BASE = os.path.join(ROOT, "witcher-compendium", "assets")
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")

MAPPING = [
    {
        "src": "cultista_del_coram_agh_tera.png",
        "dest": "BESTIARIO/MOSTRI/cultista_del_coram_agh_tera.webp",
        "json": "cultista_del_coram_agh_tera_418c67ecf457abcb.json"
    },
    {
        "src": "scagnozzi_di_mawik.png",
        "dest": "BESTIARIO/PNG/scagnozzi_di_mawik.webp",
        "json": "Scagnozzi_di_Mawik_1740ab0681735b56.json"
    }
]

def deploy():
    for item in MAPPING:
        src_p = os.path.join(TEMP_DIR, item["src"])
        dest_p = os.path.join(ASSETS_BASE, item["dest"])
        
        if not os.path.exists(src_p):
            print(f"ERRORE: {src_p} non trovato.")
            continue
            
        # 1. Conversione WebP (Alta Qualità per la 'Dignità' richiesta)
        print(f"Conversione: {item['src']} -> {item['dest']}")
        os.makedirs(os.path.dirname(dest_p), exist_ok=True)
        with Image.open(src_p) as img:
            # NON facciamo resize per mantenere la qualità/dignità massima voluta dall'utente
            img.save(dest_p, "WEBP", quality=95)
        
        # 2. Aggiornamento JSON
        json_f = item["json"]
        found = False
        for root, dirs, files in os.walk(SRC_PACKS):
            if json_f in files:
                fpath = os.path.join(root, json_f)
                with open(fpath, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                
                new_rel = f"modules/witcher-compendium/assets/{item['dest'].replace(os.sep, '/')}"
                data["img"] = new_rel
                
                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                
                print(f"JSON Aggiornato: {json_f}")
                found = True
                break
        
        if not found:
            print(f"ATTENZIONE: JSON {json_f} non trovato.")

if __name__ == "__main__":
    deploy()
    print("\nDeploy completato.")
