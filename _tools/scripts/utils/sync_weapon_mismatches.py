import os
import shutil

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
ASSETS_BASE = os.path.join(ROOT, "witcher-compendium", "assets", "EQUIPAGGIAMENTO_E_TRASPORTI", "Armi_e_Armature")

# Corrections: (Source Subdir, Source File) -> (Target Subdir, Target File)
CORRECTIONS = [
    # Viper's Fang
    ("witcher-weapons", "zanna_della_vipera.webp", "witcher-dlc-sw-equipment", "zanna_del_vipera.webp"),
    
    # Silver Swords in DLC folder
    ("witcher-weapons", "spada_dargento_del_lupo.webp", "witcher-dlc-sw-equipment", "spada_dargento_del_lupo.webp"),
    ("witcher-weapons", "spada_dargento_della_manticora.webp", "witcher-dlc-sw-equipment", "spada_dargento_del_manticora.webp"),
    ("witcher-weapons", "spada_dargento_dellorso.webp", "witcher-dlc-sw-equipment", "spada_dargento_del_orso.webp"),
    
    # Steel Swords (already in witcher-weapons, but checking names)
    # The JSON for Manticora Steel in weapons expects 'spada_dacciaio_della_manticora.webp'
]

def fix_mismatches():
    for src_sub, src_name, tgt_sub, tgt_name in CORRECTIONS:
        src_path = os.path.join(ASSETS_BASE, src_sub, src_name)
        tgt_dir = os.path.join(ASSETS_BASE, tgt_sub)
        tgt_path = os.path.join(tgt_dir, tgt_name)
        
        if os.path.exists(src_path):
            os.makedirs(tgt_dir, exist_ok=True)
            shutil.copy2(src_path, tgt_path)
            print(f"Copied & Synced: {src_sub}/{src_name} -> {tgt_sub}/{tgt_name}")
        else:
            print(f"Warning: Source not found: {src_path}")

if __name__ == "__main__":
    fix_mismatches()
