import os
from PIL import Image

target_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\REGOLAMENTO_E_NARRATIVA\Professioni_e_Abilita\witcher-skills"
batch_1_files = [
    "accortezza.webp", "alchimia.webp",
    "archi.webp", "armi_in_asta.webp", "artigianato.webp", "atletica.webp", 
    "balestre.webp", "belle_arti.webp", "benedizioni.webp", "bestiario.webp", 
    "bosco_sacro.webp", "camuffare.webp", "carisma.webp", "cavalcare.webp", 
    "commercio.webp", "contraffazione.webp", "coraggio.webp", 
    "costruire_trappole.webp", "custode_del_sapere.webp"
]

for filename in batch_1_files:
    filepath = os.path.join(target_dir, filename)
    if os.path.exists(filepath):
        try:
            with Image.open(filepath) as img:
                if img.size == (1024, 1024):
                    print(f"Fixing {filename}: Resizing 1024x1024 -> 512x512")
                    img = img.resize((512, 512), Image.Resampling.LANCZOS)
                    img.save(filepath, "WEBP", quality=90)
                else:
                    print(f"Skipping {filename}: Size is {img.size}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
    else:
        print(f"File not found: {filename}")
