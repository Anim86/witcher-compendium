import os
import shutil
from PIL import Image

# Configurazione
SOURCE_DIR = r"C:\Users\Manuel\.gemini\antigravity\brain\1c7f4eea-30ca-4f0e-baae-3a7191eccb6f"
TARGET_EQUIP_DIR = r"e:\AntigravitiProgetti\CompendioTheWitcher\assets\EQUIPAGGIAMENTO_E_TRASPORTI\_review_orphans"
TARGET_GIFTS_DIR = r"e:\AntigravitiProgetti\CompendioTheWitcher\assets\MAGIA_E_MALEDIZIONI\Doni_del_Caos\witcher-gifts"
STAGING_DIR = r"e:\AntigravitiProgetti\CompendioTheWitcher\temp_images"

# Mappatura file generati (nome_artifact: (nome_finale, target_dir))
ASSETS_TO_DEPLOY = {
    "spada_dacciaio_del_manticora_1778073970569.png": ("spada_dacciaio_del_manticora.webp", TARGET_EQUIP_DIR),
    "spada_dacciaio_del_orso_1778073989765.png": ("spada_dacciaio_del_orso.webp", TARGET_EQUIP_DIR),
    "spada_dacciaio_del_vipera_1778074004606.png": ("spada_dacciaio_del_vipera.webp", TARGET_EQUIP_DIR),
    "spada_dargento_del_vipera_1778074021384.png": ("spada_dargento_del_vipera.webp", TARGET_EQUIP_DIR),
    "strumento_musicale_elfico_1778074033155.png": ("strumento_musicale_elfico.webp", TARGET_EQUIP_DIR),
    "taglia_monete_1778074049887.png": ("taglia_monete.webp", TARGET_EQUIP_DIR),
    "tavolo_strategico_portatile_1778074065774.png": ("tavolo_strategico_portatile.webp", TARGET_EQUIP_DIR),
    "aerocinesi_1778074083263.png": ("aerocinesi.webp", TARGET_GIFTS_DIR),
    "aura_di_paura_1778074097702.png": ("aura_di_paura.webp", TARGET_GIFTS_DIR),
    "calmare_animali_1778074118081.png": ("calmare_animali.webp", TARGET_GIFTS_DIR),
    "criocinesi_1778074138086.png": ("criocinesi.webp", TARGET_GIFTS_DIR)
}

def process_image(source_path, target_path):
    print(f"Processing {source_path} -> {target_path}")
    try:
        with Image.open(source_path) as img:
            img = img.resize((512, 512), Image.Resampling.LANCZOS)
            img.save(target_path, "WEBP", quality=80)
    except Exception as e:
        print(f"Error processing {source_path}: {e}")

def main():
    for src_name, (target_name, final_dir) in ASSETS_TO_DEPLOY.items():
        src_path = os.path.join(SOURCE_DIR, src_name)
        
        # Staging path (relative to temp_images)
        rel_staging_path = ""
        if final_dir == TARGET_GIFTS_DIR:
            rel_staging_path = os.path.join("witcher-gifts", target_name)
        else:
            rel_staging_path = os.path.join("_review_orphans", target_name)
            
        staging_path = os.path.join(STAGING_DIR, rel_staging_path)
        staging_dir = os.path.dirname(staging_path)
        
        if not os.path.exists(staging_dir):
            os.makedirs(staging_dir)
            
        process_image(src_path, staging_path)
        
        # Final deployment
        if not os.path.exists(final_dir):
            os.makedirs(final_dir)
            
        final_path = os.path.join(final_dir, target_name)
        if os.path.exists(staging_path):
            shutil.copy2(staging_path, final_path)
            print(f"Deployed to {final_path}")
        else:
            print(f"Skipping deployment for {target_name} because staging file is missing.")

if __name__ == "__main__":
    main()
