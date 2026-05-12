import os
import glob
from PIL import Image

SOURCE_DIR = r"C:\Users\apaci\.gemini\antigravity\brain\5371183f-5cc0-4cf7-9c88-0a13a0576da5"
TARGET_DIR = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\EQUIPAGGIAMENTO_E_TRASPORTI\Attrezzatura_e_Oggetti\witcher-special"

# Find all generated pngs
png_files = glob.glob(os.path.join(SOURCE_DIR, "decotto_di_*.png"))

for png_path in png_files:
    basename = os.path.basename(png_path)
    # the name format is decotto_di_arachas_12345.png
    # we want to extract "decotto_di_arachas"
    parts = basename.split('_')
    # everything up to the timestamp
    new_name = "_".join(parts[:-1]) + ".webp"
    
    target_path = os.path.join(TARGET_DIR, new_name)
    
    print(f"Processing {basename} -> {new_name}...")
    
    with Image.open(png_path) as img:
        # Resize to 512x512
        img = img.resize((512, 512), Image.Resampling.LANCZOS)
        # Convert to RGB (in case of RGBA) to save as WebP without alpha if needed, but webp supports alpha
        # Actually lossy webp supports alpha but let's just save as webp
        img.save(target_path, "WEBP", quality=80)
        print(f"Saved optimized webp to {target_path}")

print("Batch 44 deployment complete.")
