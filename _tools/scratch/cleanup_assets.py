import os
import shutil

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")

def cleanup():
    # Remove any directory in assets/BESTIARIO that does not exist in src-packs/BESTIARIO
    src_bestiario = os.path.join(SRC_PACKS, "BESTIARIO")
    assets_bestiario = os.path.join(ASSETS_DIR, "BESTIARIO")
    
    if not os.path.exists(assets_bestiario): return
    
    # We'll do a recursive check
    for root, dirs, files in os.walk(assets_bestiario, topdown=False):
        rel_path = os.path.relpath(root, assets_bestiario)
        if rel_path == ".": continue
        
        corresponding_src = os.path.join(src_bestiario, rel_path)
        
        # If the directory doesn't exist in src-packs, and it only contains 
        # things we've already moved (or it's just old debris), remove it.
        # To be safe, we only remove if it's NOT in src-packs.
        if not os.path.exists(corresponding_src):
            print(f"Removing old assets directory: {rel_path}")
            shutil.rmtree(root)

if __name__ == "__main__":
    cleanup()
