import os
import json
from PIL import Image

# Asset source PNGs (all current ones)
assets = {
    "Abilità_Percezione.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_skill_perception_white_v1_1776058774920.png",
    "Abilità_Alchimia.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_skill_alchemy_white_v1_1776058786439.png",
    "Abilità_Archi.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_skill_archery_white_v1_1776058804626.png",
    "Abilità_Combattimento.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_skill_combat_white_v1_1776058822332.png",
    "Abilità_Sociale.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_skill_social_white_v1_1776058839065.png",
    "Abilità_Fisiche.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_skill_athletics_white_v2_final_1776097082698.png",
    "Abilità_Tecniche.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_skill_crafting_white_v2_final_1776097096715.png",
    "Abilità_Sapere.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_skill_knowledge_white_v2_final_1776097111870.png",
    "Abilità_Artistiche.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_skill_arts_white_v2_final_1776097125915.png",
    "Abilità_Magiche.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_skill_magic_white_v1_final_1776097143858.png"
}

dest_asset_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\ABILITA"
os.makedirs(dest_asset_dir, exist_ok=True)

# Convert and save asset webp files
for name, path in assets.items():
    if os.path.exists(path):
        img = Image.open(path)
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        img.save(os.path.join(dest_asset_dir, name), "WEBP", quality=85)
        print(f"Saved asset: {name}")

# JSON Source packs
json_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\CORE\witcher-skills"

# Mapping logic
mappings = {
    # Perception
    "Accortezza": "Abilità_Percezione.webp",
    "Consapevolezza": "Abilità_Percezione.webp",
    "Investigare": "Abilità_Percezione.webp",
    "Indagare": "Abilità_Percezione.webp",
    "Empatia": "Abilità_Percezione.webp",
    "Notare": "Abilità_Percezione.webp",
    "Fiuto": "Abilità_Percezione.webp",
    "Osservazione": "Abilità_Percezione.webp",
    "Sensibilità": "Abilità_Percezione.webp",
    "Leggere la Natura": "Abilità_Percezione.webp",

    # Alchemy
    "Alchimia": "Abilità_Alchimia.webp",
    "Erboristeria": "Abilità_Alchimia.webp",
    "Medicina": "Abilità_Alchimia.webp",
    "Preparare": "Abilità_Alchimia.webp",
    "Pronto Soccorso": "Abilità_Alchimia.webp",
    "Guaritore": "Abilità_Alchimia.webp",
    
    # Archery
    "Archi": "Abilità_Archi.webp",
    "Balestre": "Abilità_Archi.webp",
    "Armi da Lancio": "Abilità_Archi.webp",
    "Tiro": "Abilità_Archi.webp",
    
    # Combat
    "Armi in Asta": "Abilità_Combattimento.webp",
    "Spade": "Abilità_Combattimento.webp",
    "Schermaglia": "Abilità_Combattimento.webp",
    "Mani Nude": "Abilità_Combattimento.webp",
    "Lotta": "Abilità_Combattimento.webp",
    "Miscuglio": "Abilità_Combattimento.webp",
    "Difesa": "Abilità_Combattimento.webp",
    "Mischia": "Abilità_Combattimento.webp",
    "Spada": "Abilità_Combattimento.webp",
    "Asce": "Abilità_Combattimento.webp",
    "Mazze": "Abilità_Combattimento.webp",
    "Piccolo Taglio": "Abilità_Combattimento.webp",
    "Scherma": "Abilità_Combattimento.webp",
    "Rissa": "Abilità_Combattimento.webp",
    "Eludere": "Abilità_Combattimento.webp",
    "Lame Corte": "Abilità_Combattimento.webp",
    "Schivare": "Abilità_Combattimento.webp",
    
    # Social
    "Carisma": "Abilità_Sociale.webp",
    "Persuasione": "Abilità_Sociale.webp",
    "Intimidire": "Abilità_Sociale.webp",
    "Inganno": "Abilità_Sociale.webp",
    "Recitare": "Abilità_Sociale.webp",
    "Seduzione": "Abilità_Sociale.webp",
    "Etichetta": "Abilità_Sociale.webp",
    "Diplomazia": "Abilità_Sociale.webp",
    "Commercio": "Abilità_Sociale.webp",
    "Affari": "Abilità_Sociale.webp",
    "Leadership": "Abilità_Sociale.webp",
    "Raggirare": "Abilità_Sociale.webp",
    "Imbrogliare": "Abilità_Sociale.webp",
    "Esaudire": "Abilità_Sociale.webp",
    "Esibirsi": "Abilità_Sociale.webp",
    "Linguaggio": "Abilità_Sociale.webp",
    "Lingua": "Abilità_Sociale.webp",
    "Spergiurare": "Abilità_Sociale.webp",
    "Eleganza": "Abilità_Sociale.webp",
    "Insegnamento": "Abilità_Sociale.webp",

    # Physical
    "Atletica": "Abilità_Fisiche.webp",
    "Prontezza": "Abilità_Fisiche.webp",
    "Furtività": "Abilità_Fisiche.webp",
    "Nuotare": "Abilità_Fisiche.webp",
    "Cavalcare": "Abilità_Fisiche.webp",
    "Camuffare": "Abilità_Fisiche.webp",
    "Camuffamento": "Abilità_Fisiche.webp",
    "Sopravvivenza": "Abilità_Fisiche.webp",
    "Vita All'Aria": "Abilità_Fisiche.webp",
    "Navigazione": "Abilità_Fisiche.webp",
    "Tempra": "Abilità_Fisiche.webp",

    # Technical
    "Artigianato": "Abilità_Tecniche.webp",
    "Scassinare": "Abilità_Tecniche.webp",
    "Trappole": "Abilità_Tecniche.webp",
    "Contraffazione": "Abilità_Tecniche.webp",
    "Falsificare": "Abilità_Tecniche.webp",
    "Prestidigitazione": "Abilità_Tecniche.webp",

    # Knowledge
    "Istruzione": "Abilità_Sapere.webp",
    "Storia": "Abilità_Sapere.webp",
    "Bestiario": "Abilità_Sapere.webp",
    "Sapere Locale": "Abilità_Sapere.webp",
    "Saggio": "Abilità_Sapere.webp",
    "Custode del Sapere": "Abilità_Sapere.webp",
    "Deduzione": "Abilità_Sapere.webp",
    "Scaltrezza": "Abilità_Sapere.webp",
    "Tattica": "Abilità_Sapere.webp",
    "Mistagogo": "Abilità_Sapere.webp",
    "Misteri": "Abilità_Sapere.webp",

    # Arts
    "Belle Arti": "Abilità_Artistiche.webp",

    # Magic
    "Incanalare": "Abilità_Magiche.webp",
    "Rituali": "Abilità_Magiche.webp",
    "Incantesimi": "Abilità_Magiche.webp",
    "Potere Divino": "Abilità_Magiche.webp",
    "Fervore": "Abilità_Magiche.webp",
    "Benedizioni": "Abilità_Magiche.webp",
    "Bosco Sacro": "Abilità_Magiche.webp",
    "Fatture": "Abilità_Magiche.webp"
}

prefix = "modules/witcher-compendium/assets/ABILITA/"

updated_count = 0
for filename in os.listdir(json_dir):
    if filename.endswith(".json"):
        fpath = os.path.join(json_dir, filename)
        with open(fpath, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
        
        name = data.get("name", "")
        best_match = None
        
        for key, asset_name in mappings.items():
            if key.lower() in name.lower():
                best_match = asset_name
                break
        
        if best_match:
            data["img"] = f"{prefix}{best_match}"
            with open(fpath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            updated_count += 1

print(f"Updated {updated_count} Skill JSON files with full coverage minimalist icons.")
