import os
import shutil
from PIL import Image

# Configurazione
SOURCE_DIR = r"C:\Users\Manuel\.gemini\antigravity\brain\979daf2e-551e-4701-9613-9f647dc1b2f8"
TARGET_DIR = r"e:\AntigravitiProgetti\CompendioTheWitcher\assets\EQUIPAGGIAMENTO_E_TRASPORTI\_review_orphans"
STAGING_DIR = r"e:\AntigravitiProgetti\CompendioTheWitcher\temp_images\_review_orphans"

# Mappatura file generati (nome_artifact: nome_finale)
ASSETS_TO_DEPLOY = {
    "protesi_da_witcher_1778051655849.png": "protesi_da_witcher.webp",
    "protesi_focus_1778051681464.png": "protesi_focus.webp",
    "protesi_magica_1778051698605.png": "protesi_magica.webp",
    "ruote_di_scorta_1778051716270.png": "ruote_di_scorta.webp"
}

def process_image(source_path, target_path):
    print(f"Processing {source_path} -> {target_path}")
    with Image.open(source_path) as img:
        # Resize a 512x512
        img = img.resize((512, 512), Image.Resampling.LANCZOS)
        # Salva come WebP 80%
        img.save(target_path, "WEBP", quality=80)

def main():
    if not os.path.exists(STAGING_DIR):
        os.makedirs(STAGING_DIR)
    
    for src_name, target_name in ASSETS_TO_DEPLOY.items():
        src_path = os.path.join(SOURCE_DIR, src_name)
        # Prima in staging (temp_images)
        staging_path = os.path.join(STAGING_DIR, target_name)
        process_image(src_path, staging_path)
        
        # Poi nella cartella assets finale (per ora usiamo _review_orphans come indicato nel prompt_batch)
        final_path = os.path.join(TARGET_DIR, target_name)
        if not os.path.exists(TARGET_DIR):
            os.makedirs(TARGET_DIR)
        shutil.copy2(staging_path, final_path)
        print(f"Deployed to {final_path}")

if __name__ == "__main__":
    main()
