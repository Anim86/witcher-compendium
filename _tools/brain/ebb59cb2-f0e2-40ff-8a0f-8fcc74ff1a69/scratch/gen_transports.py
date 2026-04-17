import json
import uuid
import os

def generate_uuid():
    return uuid.uuid4().hex[:16]

transports = [
    ("Barca a Vela", 230, 130, "Una piccola imbarcazione dotata di una sola vela, ideale per spostarsi lungo fiumi e coste."),
    ("Bue", 278, 300, "Famoso per la sua forza e resistenza, il bue è spesso impiegato per trainare carri carichi in lunghi viaggi."),
    ("Carro", 660, 600, "Un veicolo robusto a quattro ruote progettato per il trasporto di merci pesanti, solitamente trainato da buoi o cavalli."),
    ("Carrozza", 200, 300, "Una carrozza chiusa e confortevole, adatta al trasporto di nobili o mercanti benestanti lungo le strade principali."),
    ("Cavallo", 520, 100, "L'animale da trasporto più comune, veloce e affidabile per i viaggiatori di ogni estrazione sociale."),
    ("Cavallo da Guerra", 1600, 270, "Un cavallo addestrato al combattimento, più robusto e coraggioso rispetto ai normali cavalli da monta."),
    ("Cutter", 1670, 610, "Un'imbarcazione snella e veloce, utilizzata per trasporti rapidi o per piccole spedizioni marittime."),
    ("Mulo", 200, 150, "Testardo ma infaticabile, il mulo è eccellente per trasportare carichi in territori montuosi o impervi."),
    ("Nave a Vela", 2180, 2040, "Una grande imbarcazione oceanica in grado di trasportare ingenti equipaggi e merci attraverso i mari.")
]

equipment = [
    ("Sella", 100, 5, "Una sella standard, essenziale per cavalcare senza subire penalità."),
    ("Sella da Cavalleria", 325, 6, "Sella progettata per il combattimento, offre un migliore controllo e include un pratico fodero per l'arma."),
    ("Sella da Corsa", 200, 3, "Sella leggera e aerodinamica, progettata per massimizzare la velocità della cavalcatura."),
    ("Paraocchi", 100, 0.1, "Schermi laterali per gli occhi che aiutano a mantenere la calma della cavalcatura prevenendo distrazioni."),
    ("Paraocchi da Corsa", 125, 0.1, "Paraocchi specializzati che massimizzano la concentrazione della cavalcatura durante la corsa."),
    ("Bisacce", 100, 1.5, "Robuste borse da sella per il trasporto di oggetti personali o provviste."),
    ("Bisacce Militari", 150, 2, "Bisacce rinforzate e capienti, progettate per le necessità di una campagna militare prolungata."),
    ("Bardatura di Cuoio", 550, 10, "Armatura leggera in cuoio bollito per proteggere la cavalcatura senza appesantirla eccessivamente."),
    ("Bardatura di Maglia di Ferro", 1050, 25, "Pesante protezione in maglia di ferro che garantisce un'ottima difesa alla cavalcatura in battaglia.")
]

output_dir = r"e:\AntigravitiProgetti\CompendioTheWitcher\_tools\src-packs\EQUIPAGGIAMENTO\base\witcher-transports"

def create_json(name, cost, weight, desc):
    file_name = f"{name.replace(' ', '_').replace('(', '').replace(')', '')}_{generate_uuid()}.json"
    data = {
        "_id": generate_uuid(),
        "name": name,
        "type": "item",
        "img": "icons/svg/item-bag.svg",
        "system": {
            "description": f"<p>{desc}</p>",
            "weight": weight,
            "cost": cost,
            "quantity": 1,
            "sourcebook": "MB 93"
        },
        "_stats": {
            "systemId": "TheWitcherItaNewSystem",
            "coreVersion": 14
        }
    }
    # Ensure _id and filename use the same UUID part for consistency if desired, 
    # but the rule is just "unique 16 char". Let's regenerate for the file name 
    # to be safe or use the same. I'll use the same.
    uid = generate_uuid()
    data["_id"] = uid
    file_name = f"{name.replace(' ', '_').replace('(', '').replace(')', '')}_{uid}.json"
    
    with open(os.path.join(output_dir, file_name), 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

for item in transports + equipment:
    create_json(*item)

print(f"Created {len(transports) + len(equipment)} transport files.")
