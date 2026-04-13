import os
import json
from PIL import Image

# Asset source PNGs (from brain)
assets = {
    "Abbigliamento.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_equipment_clothing_set_final_v2_1776026958306.png",
    "Strumenti.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_equipment_tools_set_final_1776026914179.png",
    "Viveri_e_Bevande.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_equipment_food_set_final_v2_1776026972449.png",
    "Contenitori.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_equipment_containers_set_final_v2_1776026986634.png",
    "Medicina_e_Alchimia.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_equipment_alchemy_set_final_v2_1776027003253.png",
    "Servizi.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_equipment_services_contract_final_v2_1776058248050.png",
    "Libri_e_Documenti.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_equipment_books_final_v1_1776058264140.png",
    "Alloggio_e_Riposo.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_equipment_housing_inn_final_v1_1776058279454.png",
    "Oggetti_Disonesti.webp": r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_equipment_rogue_gear_final_v1_1776058295014.png"
}

dest_asset_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets\EQUIPAGGIAMENTO\base\witcher-equipment"
os.makedirs(dest_asset_dir, exist_ok=True)

# Convert and save asset webp files
for name, path in assets.items():
    if os.path.exists(path):
        img = Image.open(path)
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        img.save(os.path.join(dest_asset_dir, name), "WEBP", quality=85)
        print(f"Saved asset: {name}")

# JSON Source packs
json_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\EQUIPAGGIAMENTO\base\witcher-equipment"

# Mapping logic (Simplified labels for equipment)
mappings = {
    # Clothing
    "Abiti": "Abbigliamento.webp",
    "Abbigliamento": "Abbigliamento.webp",
    "Amuleto": "Abbigliamento.webp",
    "Gioielli": "Abbigliamento.webp",
    
    # Tools
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
    
    # Food/Drinks
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
    
    # Containers
    "Bandoliera": "Contenitori.webp",
    "Borsello": "Contenitori.webp",
    "Cesta": "Contenitori.webp",
    "Forziere": "Contenitori.webp",
    "Zaino": "Contenitori.webp",
    "Sacca": "Contenitori.webp",
    "Scomparto": "Contenitori.webp",
    
    # Alchemy/Medicine
    "Alcohest": "Medicina_e_Alchimia.webp",
    "Arto": "Medicina_e_Alchimia.webp",
    "Medico": "Medicina_e_Alchimia.webp",
    "Kit Medico": "Medicina_e_Alchimia.webp",
    "Antidoto": "Medicina_e_Alchimia.webp",
    
    # Services
    "Avvocato": "Servizi.webp",
    "Galoppino": "Servizi.webp",
    "Cronista": "Servizi.webp",
    "Artigiano": "Servizi.webp",
    "Messaggero": "Servizi.webp",
    "Prosseneta": "Servizi.webp",
    "Passaggio": "Servizi.webp",
    "Giro in Carrozza": "Servizi.webp",
    "Cavallo Noleggiato": "Servizi.webp",
    
    # Books/Docs
    "Diario": "Libri_e_Documenti.webp",
    "Libro Mastro": "Libri_e_Documenti.webp",
    "Formula": "Libri_e_Documenti.webp",
    "Ricetta": "Libri_e_Documenti.webp",
    "Mappa": "Libri_e_Documenti.webp",
    
    # Housing/Inn
    "Bagno": "Alloggio_e_Riposo.webp",
    "Stanza": "Alloggio_e_Riposo.webp",
    "Affitto": "Alloggio_e_Riposo.webp",
    "Giaciglio": "Alloggio_e_Riposo.webp",
    "Focolare": "Alloggio_e_Riposo.webp",
    
    # Rogue gear
    "Ceppi": "Oggetti_Disonesti.webp",
    "Dadi truccati": "Oggetti_Disonesti.webp",
    "Benda": "Oggetti_Disonesti.webp"
}

prefix = "modules/witcher-compendium/assets/EQUIPAGGIAMENTO/base/witcher-equipment/"

updated_count = 0
for filename in os.listdir(json_dir):
    if filename.endswith(".json"):
        fpath = os.path.join(json_dir, filename)
        with open(fpath, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
        
        name = data.get("name", "")
        best_match = None
        
        # Simple substring matching for categorization
        for key, asset_name in mappings.items():
            if key.lower() in name.lower():
                best_match = asset_name
                break
        
        if best_match:
            data["img"] = f"{prefix}{best_match}"
            with open(fpath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            updated_count += 1

print(f"Updated {updated_count} JSON files with category icons.")
