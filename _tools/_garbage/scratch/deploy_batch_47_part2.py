import os
import glob
from PIL import Image

SOURCE_DIR = r"C:\Users\apaci\.gemini\antigravity\brain\5371183f-5cc0-4cf7-9c88-0a13a0576da5"
TARGET_DIR_GIFTS = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\MAGIA_E_MALEDIZIONI\Doni_del_Caos\witcher-gifts"

items = [
    "fortificare",
    "geocinesi",
    "migliorare_arma",
    "minuscola_illusione",
    "percepire_veleno",
    "piedi_rapidi",
    "pigmento",
    "pirocinesi",
    "pollice_verde"
]

for item_name in items:
    png_files = glob.glob(os.path.join(SOURCE_DIR, f"{item_name}_*.png"))
    for png_path in png_files:
        basename = os.path.basename(png_path)
        new_name = item_name + ".webp"
        
        target_path = os.path.join(TARGET_DIR_GIFTS, new_name)
        
        print(f"Processing {basename} -> {new_name}...")
        
        with Image.open(png_path) as img:
            img = img.resize((512, 512), Image.Resampling.LANCZOS)
            img.save(target_path, "WEBP", quality=80)
            print(f"Saved optimized webp to {target_path}")

print("Batch 47 (Part 2) deployment complete.")
