import os
import shutil
import re
import unicodedata
from PIL import Image

# Paths
ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
TEMP_IMAGES = os.path.join(ROOT, "temp_images")
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")
CLEANUP_LIST = os.path.join(ROOT, "_tools", "reports", "temp_cleanup_list.txt")

def slugify(value):
    value = str(value)
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '_', value)

def normalize_filename(filename):
    name, ext = os.path.splitext(filename)
    name = re.sub(r'\(.*?\)', '', name)
    return slugify(name) + ".webp"

def find_target_dir(subfolder_name):
    """Finds the correct directory in assets/ that ends with subfolder_name."""
    for root, dirs, files in os.walk(ASSETS_DIR):
        if root.endswith(subfolder_name):
            return root
    return None

def run_cleanup_and_process():
    # 1. Cleanup
    if os.path.exists(CLEANUP_LIST):
        print("Eliminazione file ridondanti...")
        with open(CLEANUP_LIST, "r") as f:
            for line in f:
                path = line.strip()
                if os.path.exists(path):
                    try:
                        os.remove(path)
                    except Exception as e:
                        print(f"Errore eliminazione {path}: {e}")
        print("Cleanup completato.")
    
    # 2. Process Orphans
    print("\nElaborazione file orfani...")
    orphans = []
    asset_map = set()
    for root, dirs, files in os.walk(ASSETS_DIR):
        for f in files:
            asset_map.add(f.lower())

    for root, dirs, files in os.walk(TEMP_IMAGES):
        for f in files:
            if not f.lower().endswith('.png'): continue
            norm_name = normalize_filename(f)
            if norm_name.lower() not in asset_map:
                orphans.append((os.path.join(root, f), os.path.basename(root)))

    for path, subfolder in orphans:
        target_dir = find_target_dir(subfolder)
        if not target_dir:
            # Fallback to a generic folder if not found
            target_dir = os.path.join(ASSETS_DIR, "CORE", subfolder)
            os.makedirs(target_dir, exist_ok=True)
        
        new_name = normalize_filename(os.path.basename(path))
        target_path = os.path.join(target_dir, new_name)
        
        print(f"Processando orfano: {os.path.basename(path)} -> {target_path}")
        try:
            with Image.open(path) as img:
                img.thumbnail((512, 512), Image.Resampling.LANCZOS)
                img.save(target_path, "WEBP", quality=80)
            os.remove(path) # Remove original after processing
        except Exception as e:
            print(f"Errore processando {path}: {e}")

    # 3. Cleanup empty dirs in temp_images
    print("\nRimozione cartelle vuote in temp_images...")
    for root, dirs, files in os.walk(TEMP_IMAGES, topdown=False):
        if not dirs and not files:
            try:
                os.rmdir(root)
            except: pass
    
    print("Operazione completata.")

if __name__ == "__main__":
    run_cleanup_and_process()
