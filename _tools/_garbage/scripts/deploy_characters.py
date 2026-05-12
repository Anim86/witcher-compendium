import os
import glob
from PIL import Image

SOURCE_DIR = r"C:\Users\apaci\.gemini\antigravity\brain\5371183f-5cc0-4cf7-9c88-0a13a0576da5"
TARGET_DIR = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\BESTIARIO\witcher-characters"

# Define characters to deploy
characters = [
    "aenarinn_quintetto_di_claremont",
    "arkam_artigiani_di_mahakam",
    "asdis_vergini_di_ferro",
    "cuor_nero_katakan"
]

for char_name in characters:
    # Find generated pngs
    png_files = glob.glob(os.path.join(SOURCE_DIR, f"{char_name}_*.png"))
    
    for png_path in png_files:
        basename = os.path.basename(png_path)
        new_name = char_name + ".webp"
        
        target_path = os.path.join(TARGET_DIR, new_name)
        
        print(f"Processing {basename} -> {new_name}...")
        
        with Image.open(png_path) as img:
            # Resize to 512x512
            img = img.resize((512, 512), Image.Resampling.LANCZOS)
            img.save(target_path, "WEBP", quality=80)
            print(f"Saved optimized webp to {target_path}")

print("Batch 45 deployment complete.")
