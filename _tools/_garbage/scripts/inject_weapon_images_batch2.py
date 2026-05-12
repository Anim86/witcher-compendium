import os
from PIL import Image

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
TARGET_WEAPONS_DIR = os.path.join(ROOT, "witcher-compendium", "assets", "EQUIPAGGIAMENTO_E_TRASPORTI", "Armi_e_Armature", "witcher-weapons")

# Map of artifact path -> (target_directory, webp_filename)
MAPPINGS = {
    r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\siringa_da_campo_1776281970943.png": 
        (TARGET_WEAPONS_DIR, "siringa_da_campo.webp"),
    r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\spada_dacciaio_della_vipera_1776281989225.png": 
        (TARGET_WEAPONS_DIR, "spada_dacciaio_della_vipera.webp"),
    r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\spada_dacciaio_dellorso_1776282007047.png": 
        (TARGET_WEAPONS_DIR, "spada_dacciaio_dellorso.webp"),
    r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\spada_dacciaio_del_gatto_1776282020331.png": 
        (TARGET_WEAPONS_DIR, "spada_dacciaio_del_gatto.webp"),
    r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\spada_dacciaio_del_grifone_1776282038396.png": 
        (TARGET_WEAPONS_DIR, "spada_dacciaio_del_grifone.webp")
}

def inject_weapon_images():
    os.makedirs(TARGET_WEAPONS_DIR, exist_ok=True)
    
    for src, (tgt_dir, filename) in MAPPINGS.items():
        if os.path.exists(src):
            try:
                dest = os.path.join(tgt_dir, filename)
                with Image.open(src) as img:
                    img = img.convert("RGBA")
                    img.thumbnail((512, 512), Image.Resampling.LANCZOS)
                    img.save(dest, "WEBP", quality=85)
                print(f"Successfully processed and placed: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")
        else:
            print(f"Source file not found: {src}")

if __name__ == "__main__":
    inject_weapon_images()
