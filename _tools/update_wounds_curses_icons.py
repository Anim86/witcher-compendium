import os
import json
from PIL import Image

# Asset source PNGs
assets = {
    # Wounds
    "Ferita_Frattura.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_wound_fracture_white_v1_1776098878179.png",
    "Ferita_Interna.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_wound_internal_white_v1_1776098892891.png",
    "Ferita_Testa.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_wound_head_white_v1_1776098907522.png",
    "Ferita_Decapitazione.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_wound_decapitation_white_v1_1776098923680.png",
    # Curses
    "Maledizione_Licantropia.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_curse_werewolf_final_v1_1776098941852.png",
    "Maledizione_Oscura.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_curse_skulldark_final_v1_1776098956708.png"
}

# Directories
dest_asset_dir_wounds = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\GAMEPLAY\wounds"
dest_asset_dir_curses = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\GAMEPLAY\curses"
os.makedirs(dest_asset_dir_wounds, exist_ok=True)
os.makedirs(dest_asset_dir_curses, exist_ok=True)

# Convert assets
for name, path in assets.items():
    if os.path.exists(path):
        dest_dir = dest_asset_dir_wounds if "Ferita" in name else dest_asset_dir_curses
        img = Image.open(path)
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        img.save(os.path.join(dest_dir, name), "WEBP", quality=85)
        print(f"Saved asset: {name}")

# JSON Updates
packs = {
    r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\GAMEPLAY\base\witcher-critical-wounds": {
        "frattura": "Ferita_Frattura.webp",
        "ossa": "Ferita_Frattura.webp",
        "costole": "Ferita_Frattura.webp",
        "spina": "Ferita_Frattura.webp",
        "mascella": "Ferita_Frattura.webp",
        "cardiaci": "Ferita_Interna.webp",
        "milza": "Ferita_Interna.webp",
        "stomaco": "Ferita_Interna.webp",
        "pneumotorace": "Ferita_Interna.webp",
        "settico": "Ferita_Interna.webp",
        "occhio": "Ferita_Testa.webp",
        "sfregio": "Ferita_Testa.webp",
        "decapitazione": "Ferita_Decapitazione.webp"
    },
    r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\GAMEPLAY\base\witcher-curses": {
        "licantropia": "Maledizione_Licantropia.webp",
        "maledizione": "Maledizione_Oscura.webp",
        "persecuzione": "Maledizione_Oscura.webp"
    }
}

prefixes = {
    "witcher-critical-wounds": "modules/witcher-compendium/assets/GAMEPLAY/wounds/",
    "witcher-curses": "modules/witcher-compendium/assets/GAMEPLAY/curses/"
}

updated_count = 0
for pack_path, mapping in packs.items():
    if not os.path.exists(pack_path): continue
    
    pack_name = os.path.basename(pack_path)
    prefix = prefixes.get(pack_name, "")
    
    for filename in os.listdir(pack_path):
        if filename.endswith(".json"):
            fpath = os.path.join(pack_path, filename)
            with open(fpath, 'r', encoding='utf-8-sig') as f:
                data = json.load(f)
            
            name = data.get("name", "").lower()
            best_match = None
            
            for key, asset_name in mapping.items():
                if key in name:
                    best_match = asset_name
                    break
            
            if best_match:
                data["img"] = f"{prefix}{best_match}"
                with open(fpath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                updated_count += 1

print(f"Updated {updated_count} Gameplay condition JSON files.")
