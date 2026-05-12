import os
import glob
from PIL import Image

SOURCE_DIR = r"C:\Users\apaci\.gemini\antigravity\brain\5371183f-5cc0-4cf7-9c88-0a13a0576da5"
ASSETS_DIR = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\MAGIA_E_MALEDIZIONI"

mapping = {
    "marchio_dellavvizzimento": r"Incantesimi_e_Rituali\witcher-invocations",
    "miracolo_di_lebioda": r"Incantesimi_e_Rituali\witcher-invocations",
    "ombra_di_bleobheris": r"Incantesimi_e_Rituali\witcher-invocations",
    "parola_evocatrice": r"Incantesimi_e_Rituali\witcher-invocations",
    "penna_del_divino": r"Incantesimi_e_Rituali\witcher-invocations"
}

for item_name, rel_dir in mapping.items():
    png_files = glob.glob(os.path.join(SOURCE_DIR, f"{item_name}_*.png"))
    for png_path in png_files:
        basename = os.path.basename(png_path)
        new_name = item_name + ".webp"
        
        target_dir = os.path.join(ASSETS_DIR, rel_dir)
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, new_name)
        
        print(f"Processing {basename} -> {new_name}...")
        
        with Image.open(png_path) as img:
            img = img.resize((512, 512), Image.Resampling.LANCZOS)
            img.save(target_path, "WEBP", quality=80)
            print(f"Saved optimized webp to {target_path}")

print("Batch 49 (Part 1) deployment complete.")
