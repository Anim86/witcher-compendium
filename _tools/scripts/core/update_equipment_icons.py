# Witcher Compendium Maintenance Tool: Equipment Icon Updater
# VERSION: 1.0.0
# LAST_UPDATE: 2026-04-14
# DESCRIPTION: Maps equipment names to category icons and updates JSON metadata in src-packs.

import os
import json

# Setup base paths relative to script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../"))

# Configuration
JSON_DIR = os.path.join(REPO_ROOT, "_tools", "src-packs", "EQUIPAGGIAMENTO", "base", "witcher-equipment")
IMG_PREFIX = "modules/witcher-compendium/assets/EQUIPAGGIAMENTO/base/witcher-equipment/"

# Mapping logic: Equipment Name fragments -> Icon Filename
MAPPINGS = {
    "Abiti": "Abbigliamento.webp",
    "Abbigliamento": "Abbigliamento.webp",
    "Amuleto": "Abbigliamento.webp",
    "Gioielli": "Abbigliamento.webp",
    "20m di Corda": "Strumenti.webp",
    "Acciarino": "Strumenti.webp",
    "Arnesi": "Strumenti.webp",
    "Attrezzatura": "Strumenti.webp",
    "Gessetto": "Strumenti.webp",
    "Incerata": "Strumenti.webp",
    "Kit da Scrittura": "Strumenti.webp",
    "Kit da Trucco": "Strumenti.webp",
    "Lanterna": "Strumenti.webp",
    "Specchio": "Strumenti.webp",
    "Strumenti": "Strumenti.webp",
    "Corda": "Strumenti.webp",
    "Forgia": "Strumenti.webp",
    "Clessidra": "Strumenti.webp",
    "Birra": "Viveri_e_Bevande.webp",
    "Borraccia": "Viveri_e_Bevande.webp",
    "Pasto": "Viveri_e_Bevande.webp",
    "Banchetto": "Viveri_e_Bevande.webp",
    "Raziosi": "Viveri_e_Bevande.webp",
    "Vino": "Viveri_e_Bevande.webp",
    "Alcolico": "Viveri_e_Bevande.webp",
    "Carne": "Viveri_e_Bevande.webp",
    "Dolciumi": "Viveri_e_Bevande.webp",
    "Cibo": "Viveri_e_Bevande.webp",
    "Acqua": "Viveri_e_Bevande.webp",
    "Bandoliera": "Contenitori.webp",
    "Borsello": "Contenitori.webp",
    "Cesta": "Contenitori.webp",
    "Forziere": "Contenitori.webp",
    "Zaino": "Contenitori.webp",
    "Sacca": "Contenitori.webp",
    "Scomparto": "Contenitori.webp",
    "Alcohest": "Medicina_e_Alchimia.webp",
    "Arto": "Medicina_e_Alchimia.webp",
    "Medico": "Medicina_e_Alchimia.webp",
    "Kit Medico": "Medicina_e_Alchimia.webp",
    "Antidoto": "Medicina_e_Alchimia.webp",
    "Avvocato": "Servizi.webp",
    "Galoppino": "Servizi.webp",
    "Cronista": "Servizi.webp",
    "Artigiano": "Servizi.webp",
    "Messaggero": "Servizi.webp",
    "Prosseneta": "Servizi.webp",
    "Passaggio": "Servizi.webp",
    "Giro in Carrozza": "Servizi.webp",
    "Cavallo Noleggiato": "Servizi.webp",
    "Diario": "Libri_e_Documenti.webp",
    "Libro Mastro": "Libri_e_Documenti.webp",
    "Formula": "Libri_e_Documenti.webp",
    "Ricetta": "Libri_e_Documenti.webp",
    "Mappa": "Libri_e_Documenti.webp",
    "Bagno": "Alloggio_e_Riposo.webp",
    "Stanza": "Alloggio_e_Riposo.webp",
    "Affitto": "Alloggio_e_Riposo.webp",
    "Giaciglio": "Alloggio_e_Riposo.webp",
    "Focolare": "Alloggio_e_Riposo.webp",
    "Ceppi": "Oggetti_Disonesti.webp",
    "Dadi truccati": "Oggetti_Disonesti.webp",
    "Benda": "Oggetti_Disonesti.webp"
}

def update_equipment():
    if not os.path.exists(JSON_DIR):
        print(f"❌ Equipment directory not found: {JSON_DIR}")
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

    print(f"✅ Updated {updated_count} Equipment JSON files.")

if __name__ == "__main__":
    update_equipment()
