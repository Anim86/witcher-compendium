import os
import json

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
JSON_DIR = os.path.join(ROOT, "_tools", "src-packs", "REGOLAMENTO_E_NARRATIVA", "Professioni_e_Abilita", "witcher-skills")
IMG_PREFIX = "modules/witcher-compendium/assets/REGOLAMENTO_E_NARRATIVA/Professioni_e_Abilita/witcher-skills/"

MAPPINGS = {
    # Percezione
    "Accortezza": "percezione.webp",
    "Consapevolezza": "percezione.webp",
    "Investigare": "percezione.webp",
    "Indagare": "percezione.webp",
    "Empatia": "percezione.webp",
    "Notare": "percezione.webp",
    "Fiuto": "percezione.webp",
    "Osservazione": "percezione.webp",
    "Sensibilità": "percezione.webp",
    "Leggere la Natura": "percezione.webp",
    "Sintonia con la Natura": "percezione.webp",
    # Alchimia
    "Erboristeria": "alchimia.webp",
    "Medicina": "alchimia.webp",
    "Preparare": "alchimia.webp",
    "Pronto Soccorso": "alchimia.webp",
    "Guaritore": "alchimia.webp",
    # Archi
    "Archi": "archi.webp",
    "Balestre": "archi.webp",
    "Armi da Lancio": "archi.webp",
    "Tiro": "archi.webp",
    # Combattimento
    "Armi in Asta": "combattimento.webp",
    "Spade": "combattimento.webp",
    "Schermaglia": "combattimento.webp",
    "Mani Nude": "combattimento.webp",
    "Lotta": "combattimento.webp",
    "Miscuglio": "combattimento.webp",
    "Difesa": "combattimento.webp",
    "Mischia": "combattimento.webp",
    "Spada": "combattimento.webp",
    "Asce": "combattimento.webp",
    "Mazze": "combattimento.webp",
    "Piccolo Taglio": "combattimento.webp",
    "Scherma": "combattimento.webp",
    "Rissa": "combattimento.webp",
    "Eludere": "combattimento.webp",
    "Lame Corte": "combattimento.webp",
    "Schivare": "combattimento.webp",
    "Forma Bestiale": "combattimento.webp",
    # Sociale
    "Carisma": "sociale.webp",
    "Persuasione": "sociale.webp",
    "Intimidire": "sociale.webp",
    "Inganno": "sociale.webp",
    "Recitare": "sociale.webp",
    "Seduzione": "sociale.webp",
    "Etichetta": "sociale.webp",
    "Diplomazia": "sociale.webp",
    "Commercio": "sociale.webp",
    "Affari": "sociale.webp",
    "Leadership": "sociale.webp",
    "Raggirare": "sociale.webp",
    "Imbrogliare": "sociale.webp",
    "Esaudire": "sociale.webp",
    "Esibirsi": "sociale.webp",
    "Linguaggio": "sociale.webp",
    "Lingua": "sociale.webp",
    "Spergiurare": "sociale.webp",
    "Eleganza": "sociale.webp",
    "Insegnamento": "sociale.webp",
    "Gioco d'Azzardo": "sociale.webp",
    "Resistere a Coercizione": "sociale.webp",
    # Fisiche
    "Atletica": "fisiche.webp",
    "Prontezza": "fisiche.webp",
    "Furtività": "fisiche.webp",
    "Nuotare": "fisiche.webp",
    "Cavalcare": "fisiche.webp",
    "Camuffare": "fisiche.webp",
    "Camuffamento": "fisiche.webp",
    "Sopravvivenza": "fisiche.webp",
    "Vita All'Aria": "fisiche.webp",
    "Navigazione": "fisiche.webp",
    "Tempra": "fisiche.webp",
    "Coraggio": "fisiche.webp",
    # Tecniche
    "Artigianato": "tecniche.webp",
    "Manifattura": "tecniche.webp",
    "Scassinare": "tecniche.webp",
    "Trappole": "tecniche.webp",
    "Contraffazione": "tecniche.webp",
    "Falsificare": "tecniche.webp",
    "Prestidigitazione": "tecniche.webp",
    # Sapere
    "Istruzione": "sapere.webp",
    "Storia": "sapere.webp",
    "Bestiario": "sapere.webp",
    "Sapere Locale": "sapere.webp",
    "Saggio": "sapere.webp",
    "Custode del Sapere": "sapere.webp",
    "Deduzione": "sapere.webp",
    "Scaltrezza": "sapere.webp",
    "Tattica": "sapere.webp",
    "Mistagogo": "sapere.webp",
    "Misteri": "sapere.webp",
    # Artistiche
    "Belle Arti": "artistiche.webp",
    # Magiche
    "Incanalare": "magiche.webp",
    "Rituali": "magiche.webp",
    "Incantesimi": "magiche.webp",
    "Potere Divino": "magiche.webp",
    "Fervore": "magiche.webp",
    "Benedizioni": "magiche.webp",
    "Bosco Sacro": "magiche.webp",
    "Guardiano del Bosco": "magiche.webp",
    "Fatture": "magiche.webp",
    "Iniziato degli Dei": "magiche.webp",
    "Parola di Dio": "magiche.webp",
    "Sovranità": "magiche.webp",
    "Patto Animale": "magiche.webp",
    "Rito della Quercia": "magiche.webp",
    "Resistere alla Magia": "magiche.webp",
    "Preveggenza": "magiche.webp",
    "Sangue e Ossa": "magiche.webp"
}

def fix_mapping():
    if not os.path.exists(JSON_DIR):
        print(f"Directory not found: {JSON_DIR}")
        return

    updated = 0
    for f in os.listdir(JSON_DIR):
        if f.endswith(".json"):
            path = os.path.join(JSON_DIR, f)
            with open(path, 'r', encoding='utf-8-sig') as jf:
                data = json.load(jf)
            
            name = data.get("name", "")
            found_img = None
            
            # Check for direct match
            if name in MAPPINGS:
                found_img = MAPPINGS[name]
            else:
                # Check for fragment match
                for key in MAPPINGS:
                    if key.lower() in name.lower():
                        found_img = MAPPINGS[key]
                        break
            
            if found_img:
                new_img = IMG_PREFIX + found_img
                if data.get("img") != new_img:
                    data["img"] = new_img
                    with open(path, 'w', encoding='utf-8') as jf:
                        json.dump(data, jf, indent=4, ensure_ascii=False)
                    updated += 1
                    print(f"Updating {name} -> {found_img}")

    print(f"Total updated: {updated}")

if __name__ == "__main__":
    fix_mapping()
