import os
import glob
from PIL import Image

# Current Brain Directory (Source of PNGs)
SOURCE_DIR = r"C:\Users\Manuel\.gemini\antigravity\brain\979daf2e-551e-4701-9613-9f647dc1b2f8"
# Repository Root
REPO_ROOT = r"e:\AntigravitiProgetti\CompendioTheWitcher"
ASSETS_BASE = os.path.join(REPO_ROOT, "witcher-compendium", "assets", "EQUIPAGGIAMENTO_E_TRASPORTI", "Armi_e_Armature")

# Mapping of item names to their specific DLC subfolder
MAPPING = {
    "guida_del_raccoglitore": "witcher-dlc-ap-equipment",
    "incensiere_medico": "witcher-dlc-ap-equipment",
    "lanterne_da_carro": "witcher-dlc-sr-equipment",
    "libro_di_racconti": "witcher-dlc-ap-equipment",
    "mantello_mimetico": "witcher-dlc-ap-equipment",
    "migliorie_per_balestre": "witcher-dlc-ts-equipment",
    "otre": "witcher-dlc-ts-equipment",
    "pietra_solare": "witcher-dlc-ts-equipment",
    "potestaquisitor": "witcher-dlc-ap-equipment",
    "protesi_base": "witcher-dlc-dp-equipment",
}

def process_batch():
    for item_prefix, subfolder in MAPPING.items():
        # Find the latest generated PNG for this item
        pattern = os.path.join(SOURCE_DIR, f"{item_prefix}_*.png")
        png_files = glob.glob(pattern)
        
        if not png_files:
            print(f"WARNING: No PNG found for {item_prefix}")
            continue
            
        # Get the most recent one by timestamp in filename or just use the first one found
        # (Since we just generated them, any will do, but let's be safe)
        png_path = max(png_files, key=os.path.getctime)
        
        target_dir = os.path.join(ASSETS_BASE, subfolder)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            print(f"Created directory: {target_dir}")
            
        target_path = os.path.join(target_dir, f"{item_prefix}.webp")
        
        print(f"Processing {os.path.basename(png_path)} -> {item_prefix}.webp...")
        
        try:
            with Image.open(png_path) as img:
                # Standard: 512x512, Lanczos, WebP 80%
                img = img.resize((512, 512), Image.Resampling.LANCZOS)
                img.save(target_path, "WEBP", quality=80)
                print(f"Successfully saved to {target_path}")
        except Exception as e:
            print(f"ERROR processing {item_prefix}: {e}")

if __name__ == "__main__":
    process_batch()
    print("\nBatch 45 deployment complete.")
