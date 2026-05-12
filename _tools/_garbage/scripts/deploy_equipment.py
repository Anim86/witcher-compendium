import os
import glob
from PIL import Image

SOURCE_DIR = r"C:\Users\apaci\.gemini\antigravity\brain\5371183f-5cc0-4cf7-9c88-0a13a0576da5"
TARGET_DIR = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\EQUIPAGGIAMENTO_E_TRASPORTI\Attrezzatura_e_Oggetti\witcher-equipment"

items = ["lanterna", "lucchetto"]

for item_name in items:
    png_files = glob.glob(os.path.join(SOURCE_DIR, f"{item_name}_*.png"))
    for png_path in png_files:
        basename = os.path.basename(png_path)
        new_name = item_name + ".webp"
        
        target_path = os.path.join(TARGET_DIR, new_name)
        
        print(f"Processing {basename} -> {new_name}...")
        
        with Image.open(png_path) as img:
            img = img.resize((512, 512), Image.Resampling.LANCZOS)
            img.save(target_path, "WEBP", quality=80)
            print(f"Saved optimized webp to {target_path}")

print("Batch 46 deployment (partial) complete.")
