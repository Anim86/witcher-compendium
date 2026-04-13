import os
import shutil

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")
MOSTRI_DIR = os.path.join(SRC_PACKS, "BESTIARIO", "MOSTRI")

def restore():
    os.makedirs(MOSTRI_DIR, exist_ok=True)
    
    targets = [
        os.path.join(SRC_PACKS, "BESTIARIO", "PNG", "base", "witcher-monsters"),
        os.path.join(SRC_PACKS, "BESTIARIO", "PNG", "caos", "witcher-monsters-chaos"),
        os.path.join(SRC_PACKS, "BESTIARIO", "PNG", "racconti", "witcher-monsters-racconti"),
        os.path.join(SRC_PACKS, "BESTIARIO", "PNG", "diario", "witcher-monsters-diario")
    ]
    
    moved_count = 0
    for target in targets:
        if os.path.exists(target):
            for filename in os.listdir(target):
                shutil.move(os.path.join(target, filename), os.path.join(MOSTRI_DIR, filename))
                moved_count += 1
            # Try to remove empty dirs
            try:
                os.removedirs(target)
            except:
                pass
                
    print(f"Restored {moved_count} files to {MOSTRI_DIR}")

if __name__ == "__main__":
    restore()
