import os
import shutil
from PIL import Image

# Configurazione
SOURCE_DIR = r"C:\Users\Manuel\.gemini\antigravity\brain\1c7f4eea-30ca-4f0e-baae-3a7191eccb6f"
TARGET_DIR = r"e:\AntigravitiProgetti\CompendioTheWitcher\assets\EQUIPAGGIAMENTO_E_TRASPORTI\_review_orphans"
STAGING_DIR = r"e:\AntigravitiProgetti\CompendioTheWitcher\temp_images\_review_orphans"

# Mappatura file generati (nome_artifact: nome_finale)
ASSETS_TO_DEPLOY = {
    "schema_sedia_a_rotelle_base_1778073788996.png": "schema_sedia_a_rotelle_base.webp",
    "schema_sedia_a_rotelle_di_qualita_1778073807714.png": "schema_sedia_a_rotelle_di_qualita.webp",
    "scudo_del_manticora_1778073822282.png": "scudo_del_manticora.webp",
    "sedia_a_rotelle_base_1778073836681.png": "sedia_a_rotelle_base.webp",
    "sedia_a_rotelle_di_qualita_1778073856581.png": "sedia_a_rotelle_di_qualita.webp",
    "serratura_con_trappola_1778073872551.png": "serratura_con_trappola.webp"
}

def process_image(source_path, target_path):
    print(f"Processing {source_path} -> {target_path}")
    try:
        with Image.open(source_path) as img:
            # Resize a 512x512
            img = img.resize((512, 512), Image.Resampling.LANCZOS)
            # Salva come WebP 80%
            img.save(target_path, "WEBP", quality=80)
    except Exception as e:
        print(f"Error processing {source_path}: {e}")

def main():
    if not os.path.exists(STAGING_DIR):
        os.makedirs(STAGING_DIR)
    
    for src_name, target_name in ASSETS_TO_DEPLOY.items():
        src_path = os.path.join(SOURCE_DIR, src_name)
        # Prima in staging (temp_images)
        staging_path = os.path.join(STAGING_DIR, target_name)
        process_image(src_path, staging_path)
        
        # Poi nella cartella assets finale
        final_path = os.path.join(TARGET_DIR, target_name)
        if not os.path.exists(TARGET_DIR):
            os.makedirs(TARGET_DIR)
        
        if os.path.exists(staging_path):
            shutil.copy2(staging_path, final_path)
            print(f"Deployed to {final_path}")
        else:
            print(f"Skipping deployment for {target_name} because staging file is missing.")

if __name__ == "__main__":
    main()
