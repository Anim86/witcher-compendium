import os
import json

# Witcher Compendium Maintenance: Special Asset Migration (Normalized)
# This script was used to convert generated PNG icons to WebP.
# It is kept for historical reference.

# Dynamic REPO_ROOT resolution
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Path: _tools/scripts/archive/migrations/save_special_assets.py -> ../../../../
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../../"))

# NOTE: The original PNG source files were located in a temporary brain folder.
# To reuse this script, place PNG files in a local 'temp_source' folder
# and update the paths below.
PNG_SOURCE_DIR = os.path.join(REPO_ROOT, "_tools", "scripts", "assets-src", "temp_source")

assets = {
    "Spada_Argento_Witcher.webp": "icon_witcher_silver_sword.png",
    "Spada_Acciaio_Witcher.webp": "icon_witcher_steel_sword.png",
    "Witcher_Pozione.webp": "icon_witcher_potion.png",
    "Witcher_Decotto.webp": "icon_witcher_decoctum.png",
    "Witcher_Unguento.webp": "icon_witcher_oil.png",
    "Medaglione_Witcher.webp": "icon_witcher_medallion.png",
    "Runa_Witcher.webp": "icon_witcher_rune.png"
}

dest_asset_dir = os.path.join(REPO_ROOT, "witcher-compendium", "assets", "EQUIPAGGIAMENTO", "base", "witcher-special")

def migrate():
    print(f"MIGRATION ARCHIVE: Processing special assets...")
    
    # Try to import PIL only if needed
    try:
        from PIL import Image
    except ImportError:
        print("ERROR: PIL (Pillow) library not found. Use 'pip install Pillow' to use this migration script.")
        return

    os.makedirs(dest_asset_dir, exist_ok=True)

    for webp_name, png_name in assets.items():
        png_path = os.path.join(PNG_SOURCE_DIR, png_name)
        if os.path.exists(png_path):
            img = Image.open(png_path)
            img = img.resize((256, 256), Image.Resampling.LANCZOS)
            img.save(os.path.join(dest_asset_dir, webp_name), "WEBP", quality=85)
            print(f"DONE: Saved asset: {webp_name}")
        else:
            print(f"WARNING: Source not found: {png_name} at {png_path}")

if __name__ == "__main__":
    migrate()
