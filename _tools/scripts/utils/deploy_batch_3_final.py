from process_ai_assets import process_asset

# Batch 3 - Finalizzazione
ARTIFACTS = {
    "Cultista": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_cultista_coram_v3_darkflow_fixed2_1776165296023.png", "BESTIARIO/MOSTRI/cultista_coram.webp", "cultista_del_coram_agh_tera_418c67ecf457abcb.json"],
    "Leshen": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_leshen_v2_darkflow_fixed_1776165256839.png", "BESTIARIO/MOSTRI/leshen.webp", "Leshen_d25be16a30987c4f.json"],
    "Foglet": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_foglet_v2_darkflow_fixed_1776165273503.png", "BESTIARIO/MOSTRI/foglet.webp", "Foglet_02deb874c639fa51.json"]
}

# Ricerca Bes (Bies) - Il file JSON visto era BES_7e2ac369b1344d85.json
ARTIFACTS["Bes"] = [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_bies_v1_darkflow_1776165236853.png", "BESTIARIO/MOSTRI/bes.webp", "BES_7e2ac369b1344d85.json"]

for name, params in ARTIFACTS.items():
    try:
        process_asset(params[0], params[1], params[2])
    except Exception as e:
        print(f"Errore su {name}: {e}")
