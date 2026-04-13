import os
from PIL import Image

# Asset source PNGs (from brain)
assets = {
    "Spada_Argento_Witcher.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_witcher_silver_sword_final_v1_1776055998940.png",
    "Spada_Acciaio_Witcher.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_witcher_steel_sword_final_v1_1776056013525.png",
    "Witcher_Pozione.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_witcher_potion_final_v1_1776056028810.png",
    "Witcher_Decotto.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_witcher_decoctum_final_v1_1776056040049.png",
    "Witcher_Unguento.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_witcher_oil_final_v1_1776056054079.png",
    "Medaglione_Witcher.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_witcher_medallion_final_v1_1776056073450.png",
    "Runa_Witcher.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_witcher_rune_final_v1_1776056087689.png"
}

dest_asset_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\EQUIPAGGIAMENTO\base\witcher-special"
os.makedirs(dest_asset_dir, exist_ok=True)

# Convert and save asset webp files
for name, path in assets.items():
    if os.path.exists(path):
        img = Image.open(path)
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        img.save(os.path.join(dest_asset_dir, name), "WEBP", quality=85)
        print(f"Saved asset: {name}")
    else:
        print(f"ERROR: Source not found for {name} at {path}")
