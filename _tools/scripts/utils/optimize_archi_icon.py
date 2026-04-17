import os
from PIL import Image

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
INPUT_PATH = os.path.join(ROOT, "temp_images", "archi.png")
OUTPUT_DIR = os.path.join(ROOT, "witcher-compendium", "assets", "REGOLAMENTO_E_NARRATIVA", "Professioni_e_Abilita", "witcher-skills")
OUTPUT_E_DIR = r"E:\FoundryVTT_Data\Data\modules\witcher-compendium\assets\REGOLAMENTO_E_NARRATIVA\Professioni_e_Abilita\witcher-skills"

def process():
    if not os.path.exists(INPUT_PATH):
        print(f"Error: Input file not found {INPUT_PATH}")
        return

    # 1. Optimize and Resize
    print(f"Optimizing {INPUT_PATH}...")
    with Image.open(INPUT_PATH) as img:
        img = img.convert("RGBA")
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        
        output_name = "archi.webp"
        
        # Save to local repo
        output_file_c = os.path.join(OUTPUT_DIR, output_name)
        img.save(output_file_c, "WEBP", quality=90)
        print(f"Saved to local: {output_file_c}")
        
        # Save to E: (Foundry Data)
        if os.path.exists(OUTPUT_E_DIR):
            output_file_e = os.path.join(OUTPUT_E_DIR, output_name)
            img.save(output_file_e, "WEBP", quality=90)
            print(f"Saved to E: {output_file_e}")
        else:
            print(f"Warning: E: drive path not found {OUTPUT_E_DIR}")

if __name__ == "__main__":
    process()
