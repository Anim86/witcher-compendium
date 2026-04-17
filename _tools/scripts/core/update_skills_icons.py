# Witcher Compendium Maintenance Tool: Skill Icon Updater
# VERSION: 1.0.0
# LAST_UPDATE: 2026-04-14
# DESCRIPTION: Maps skill names to specific icons and updates JSON metadata in src-packs.

import os
import json
from PIL import Image

# Setup base paths relative to script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../"))

# Configuration
DEST_ASSET_DIR = os.path.join(REPO_ROOT, "witcher-compendium", "assets", "ABILITA")
JSON_DIR = os.path.join(REPO_ROOT, "_tools", "src-packs", "CORE", "witcher-skills")
IMG_PREFIX = "modules/witcher-compendium/assets/ABILITA/"

os.makedirs(DEST_ASSET_DIR, exist_ok=True)

# Mapping logic: Skill Name fragments -> Icon Filename
MAPPINGS = {
    "Accortezza": "Abilita_Percezione.webp",
    "Consapevolezza": "Abilita_Percezione.webp",
    "Investigare": "Abilita_Percezione.webp",
    "Indagare": "Abilita_Percezione.webp",
    "Empatia": "Abilita_Percezione.webp",
    "Notare": "Abilita_Percezione.webp",
    "Fiuto": "Abilita_Percezione.webp",
    "Osservazione": "Abilita_Percezione.webp",
    "Sensibilità": "Abilita_Percezione.webp",
    "Leggere la Natura": "Abilita_Percezione.webp",
    "Sintonia con la Natura": "Abilita_Percezione.webp",
    "Alchimia": "Abilita_Alchimia.webp",
    "Erboristeria": "Abilita_Alchimia.webp",
    "Medicina": "Abilita_Alchimia.webp",
    "Preparare": "Abilita_Alchimia.webp",
    "Pronto Soccorso": "Abilita_Alchimia.webp",
    "Guaritore": "Abilita_Alchimia.webp",
    "Archi": "Abilita_Archi.webp",
    "Balestre": "Abilita_Archi.webp",
    "Armi da Lancio": "Abilita_Archi.webp",
    "Tiro": "Abilita_Archi.webp",
    "Armi in Asta": "Abilita_Combattimento.webp",
    "Spade": "Abilita_Combattimento.webp",
    "Schermaglia": "Abilita_Combattimento.webp",
    "Mani Nude": "Abilita_Combattimento.webp",
    "Lotta": "Abilita_Combattimento.webp",
    "Miscuglio": "Abilita_Combattimento.webp",
    "Difesa": "Abilita_Combattimento.webp",
    "Mischia": "Abilita_Combattimento.webp",
    "Spada": "Abilita_Combattimento.webp",
    "Asce": "Abilita_Combattimento.webp",
    "Mazze": "Abilita_Combattimento.webp",
    "Piccolo Taglio": "Abilita_Combattimento.webp",
    "Scherma": "Abilita_Combattimento.webp",
    "Rissa": "Abilita_Combattimento.webp",
    "Eludere": "Abilita_Combattimento.webp",
    "Lame Corte": "Abilita_Combattimento.webp",
    "Schivare": "Abilita_Combattimento.webp",
    "Forma Bestiale": "Abilita_Combattimento.webp",
    "Carisma": "Abilita_Sociale.webp",
    "Persuasione": "Abilita_Sociale.webp",
    "Intimidire": "Abilita_Sociale.webp",
    "Inganno": "Abilita_Sociale.webp",
    "Recitare": "Abilita_Sociale.webp",
    "Seduzione": "Abilita_Sociale.webp",
    "Etichetta": "Abilita_Sociale.webp",
    "Diplomazia": "Abilita_Sociale.webp",
    "Commercio": "Abilita_Sociale.webp",
    "Affari": "Abilita_Sociale.webp",
    "Leadership": "Abilita_Sociale.webp",
    "Raggirare": "Abilita_Sociale.webp",
    "Imbrogliare": "Abilita_Sociale.webp",
    "Esaudire": "Abilita_Sociale.webp",
    "Esibirsi": "Abilita_Sociale.webp",
    "Linguaggio": "Abilita_Sociale.webp",
    "Lingua": "Abilita_Sociale.webp",
    "Spergiurare": "Abilita_Sociale.webp",
    "Eleganza": "Abilita_Sociale.webp",
    "Insegnamento": "Abilita_Sociale.webp",
    "Gioco d'Azzardo": "Abilita_Sociale.webp",
    "Resistere a Coercizione": "Abilita_Sociale.webp",
    "Atletica": "Abilita_Fisiche.webp",
    "Prontezza": "Abilita_Fisiche.webp",
    "Furtività": "Abilita_Fisiche.webp",
    "Nuotare": "Abilita_Fisiche.webp",
    "Cavalcare": "Abilita_Fisiche.webp",
    "Camuffare": "Abilita_Fisiche.webp",
    "Camuffamento": "Abilita_Fisiche.webp",
    "Sopravvivenza": "Abilita_Fisiche.webp",
    "Vita All'Aria": "Abilita_Fisiche.webp",
    "Navigazione": "Abilita_Fisiche.webp",
    "Tempra": "Abilita_Fisiche.webp",
    "Coraggio": "Abilita_Fisiche.webp",
    "Artigianato": "Abilita_Tecniche.webp",
    "Manifattura": "Abilita_Tecniche.webp",
    "Scassinare": "Abilita_Tecniche.webp",
    "Trappole": "Abilita_Tecniche.webp",
    "Contraffazione": "Abilita_Tecniche.webp",
    "Falsificare": "Abilita_Tecniche.webp",
    "Prestidigitazione": "Abilita_Tecniche.webp",
    "Istruzione": "Abilita_Sapere.webp",
    "Storia": "Abilita_Sapere.webp",
    "Bestiario": "Abilita_Sapere.webp",
    "Sapere Locale": "Abilita_Sapere.webp",
    "Saggio": "Abilita_Sapere.webp",
    "Custode del Sapere": "Abilita_Sapere.webp",
    "Deduzione": "Abilita_Sapere.webp",
    "Scaltrezza": "Abilita_Sapere.webp",
    "Tattica": "Abilita_Sapere.webp",
    "Mistagogo": "Abilita_Sapere.webp",
    "Misteri": "Abilita_Sapere.webp",
    "Belle Arti": "Abilita_Artistiche.webp",
    "Incanalare": "Abilita_Magiche.webp",
    "Rituali": "Abilita_Magiche.webp",
    "Incantesimi": "Abilita_Magiche.webp",
    "Potere Divino": "Abilita_Magiche.webp",
    "Fervore": "Abilita_Magiche.webp",
    "Benedizioni": "Abilita_Magiche.webp",
    "Bosco Sacro": "Abilita_Magiche.webp",
    "Guardiano del Bosco": "Abilita_Magiche.webp",
    "Fatture": "Abilita_Magiche.webp",
    "Iniziato degli Dei": "Abilita_Magiche.webp",
    "Parola di Dio": "Abilita_Magiche.webp",
    "Sovranità": "Abilita_Magiche.webp",
    "Patto Animale": "Abilita_Magiche.webp",
    "Rito della Quercia": "Abilita_Magiche.webp",
    "Resistere alla Magia": "Abilita_Magiche.webp",
    "Preveggenza": "Abilita_Magiche.webp",
    "Sangue e Ossa": "Abilita_Magiche.webp"
}

def update_skills():
    if not os.path.exists(JSON_DIR):
        print(f"❌ Skill directory not found: {JSON_DIR}")
        return

    updated_count = 0
    for filename in os.listdir(JSON_DIR):
        if filename.endswith(".json"):
            fpath = os.path.join(JSON_DIR, filename)
            try:
                with open(fpath, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                
                name = data.get("name", "")
                best_match = None
                
                for key, asset_name in MAPPINGS.items():
                    if key.lower() in name.lower():
                        best_match = asset_name
                        break
                
                if best_match:
                    new_img = f"{IMG_PREFIX}{best_match}"
                    if data.get("img") != new_img:
                        data["img"] = new_img
                        with open(fpath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, indent=4, ensure_ascii=False)
                        updated_count += 1
            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")

    print(f"✅ Updated {updated_count} Skill JSON files.")

if __name__ == "__main__":
    update_skills()
