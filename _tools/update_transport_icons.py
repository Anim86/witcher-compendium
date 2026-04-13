import os
import json
from PIL import Image

# Asset source PNGs
assets = {
    "Cavallo_Comune.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_transport_horse_common_final_v1_1776098406065.png",
    "Cavallo_Guerra.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_transport_warhorse_final_v1_1776098421277.png",
    "Imbarcazione.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_transport_boat_final_v1_1776098438002.png",
    "Carro.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_transport_wagon_final_v1_1776098455200.png",
    "Sella.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_transport_saddle_final_v1_1776098473039.png",
    "Bisacce.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_transport_saddlebags_final_v1_1776098488953.png"
}

dest_asset_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\EQUIPAGGIAMENTO\base\witcher-transports"
os.makedirs(dest_asset_dir, exist_ok=True)

# Convert and save asset webp files
for name, path in assets.items():
    if os.path.exists(path):
        img = Image.open(path)
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        img.save(os.path.join(dest_asset_dir, name), "WEBP", quality=85)
        print(f"Saved asset: {name}")

# JSON Source packs
json_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\EQUIPAGGIAMENTO\base\witcher-transports"

# Mapping logic
mappings = {
    "Cavallo": "Cavallo_Comune.webp",
    "Mulo": "Cavallo_Comune.webp",
    "Bue": "Cavallo_Comune.webp",
    "Guerra": "Cavallo_Guerra.webp",
    "Barca": "Imbarcazione.webp",
    "Cutter": "Imbarcazione.webp",
    "Nave": "Imbarcazione.webp",
    "Carro": "Carro.webp",
    "Carrozza": "Carro.webp",
    "Sella": "Sella.webp",
    "Bardatura": "Sella.webp",
    "Paraocchi": "Sella.webp",
    "Bisacce": "Bisacce.webp"
}

prefix = "modules/witcher-compendium/assets/EQUIPAGGIAMENTO/base/witcher-transports/"

updated_count = 0
for filename in os.listdir(json_dir):
    if filename.endswith(".json"):
        fpath = os.path.join(json_dir, filename)
        with open(fpath, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
        
        name = data.get("name", "")
        best_match = None
        
        for key, asset_name in mappings.items():
            if key.lower() in name.lower():
                best_match = asset_name
                break
        
        if best_match:
            data["img"] = f"{prefix}{best_match}"
            with open(fpath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            updated_count += 1

print(f"Updated {updated_count} Transport JSON files.")
