import os
from PIL import Image
import sys

def convert_to_webp(input_path, output_path):
    try:
        with Image.open(input_path) as img:
            # Enforce 512x512 resizing
            if img.size != (512, 512):
                print(f"Resizing {input_path} from {img.size} to (512, 512)")
                img = img.resize((512, 512), Image.Resampling.LANCZOS)
            
            # Convert to RGB if it has transparency
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.save(output_path, "WEBP", quality=90)
        print(f"Successfully converted {input_path} to {output_path}")
        return True
    except Exception as e:
        print(f"Error converting {input_path}: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_skill_icons.py <input_file> <target_name>")
        sys.exit(1)

    input_file = sys.argv[1]
    target_name = sys.argv[2] # e.g., archi.webp
    
    target_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\REGOLAMENTO_E_NARRATIVA\Professioni_e_Abilita\witcher-skills"
    output_path = os.path.join(target_dir, target_name)
    
    if convert_to_webp(input_file, output_path):
        # Optional: delete source file
        # os.remove(input_file)
        pass
