import os
import re
import shutil

TEMP_DIR = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\temp_images"
DEST_DIR = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\REGOLAMENTO_E_NARRATIVA\Geografia\witcher-geografia"

def clean_filename(fname):
    # Remove extension
    base, ext = os.path.splitext(fname)
    
    # Remove PagXX_LXX_ prefixes
    base = re.sub(r'^Pag\d+_L\d+_', '', base)
    
    # Remove trailing _XX numbers
    base = re.sub(r'_\d+$', '', base)
    
    # Lowercase and replace spaces/hyphens with underscore
    base = base.lower().replace(' ', '_').replace('-', '_')
    
    # Special mappings for known mismatched names
    mapping = {
        "skellige": "isole_skellige",
        "il_cuore_di_nilfgaard": "impero_di_nilfgaard",
        "lega_di_hengefor": "lega_di_hengeforst"
    }
    
    if base in mapping:
        base = mapping[base]
        
    return base + ext

def process_temp_images():
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR, exist_ok=True)
        
    for f in os.listdir(TEMP_DIR):
        if f.endswith(('.png', '.webp', '.jpg')):
            old_path = os.path.join(TEMP_DIR, f)
            new_name = clean_filename(f)
            new_path = os.path.join(DEST_DIR, new_name)
            
            print(f"Moving & Cleaning: {f} -> {new_name}")
            shutil.move(old_path, new_path)

if __name__ == "__main__":
    process_temp_images()
