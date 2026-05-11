import os
import sys
from PIL import Image

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
TEMP_DIR = os.path.join(ROOT, "temp_images", "witcher-alchemy")
TARGET_DIR = os.path.join(ROOT, "witcher-compendium", "assets", "ALCHIMIA_E_ARTIGIANATO", "Formule_e_Ricette", "witcher-alchemy")

def slugify(text):
    import re
    text = text.lower()
    # Remove common suffixes
    text = re.sub(r'(_wp_|_wo_|_dec_|_ex_\d+)', '', text)
    # Replace special chars with underscore
    text = re.sub(r'[\'\"«»„“”\(\)\[\]\:\,]', '_', text)
    text = re.sub(r'[^\w\s-]', '_', text)
    text = re.sub(r'[-\s]+', '_', text)
    text = re.sub(r'__+', '_', text)
    return text.strip('_')

def process():
    if not os.path.exists(TEMP_DIR):
        print(f"Directory {TEMP_DIR} not found.")
        return

    os.makedirs(TARGET_DIR, exist_ok=True)
    files = os.listdir(TEMP_DIR)
    
    for f in files:
        if not f.lower().endswith(".png"):
            continue
            
        orig_path = os.path.join(TEMP_DIR, f)
        base = os.path.splitext(f)[0]
        new_base = slugify(base)
        
        # Also ensure "formula_" prefix if missing
        if not new_base.startswith("formula_"):
            new_base = "formula_" + new_base
            
        dest_filename = f"{new_base}.webp"
        dest_path = os.path.join(TARGET_DIR, dest_filename)
        
        try:
            img = Image.open(orig_path)
            # Resize to 512px if larger
            if img.width > 512 or img.height > 512:
                img.thumbnail((512, 512), Image.Resampling.LANCZOS)
            
            img.save(dest_path, "WEBP", quality=85)
            print(f"Processed: {f} -> {dest_filename}")
            
            # Delete original from temp
            os.remove(orig_path)
            
        except Exception as e:
            print(f"Error processing {f}: {e}")

if __name__ == "__main__":
    process()
