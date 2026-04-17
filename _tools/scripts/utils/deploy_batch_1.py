from process_ai_assets import process_asset

# Percorsi Artifact (da aggiornare con gli ID correnti)
ARTIFACTS = {
    "Geralt": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_geralt_rivia_v1_1776161863772.png", "BESTIARIO/PNG/geralt_di_rivia.webp", "Geralt_di_Rivia_6e70635f67657261.json"],
    "Yennefer": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_yennefer_vengerberg_v1_1776161876232.png", "BESTIARIO/PNG/yennefer_di_vengerberg.webp", "Yennefer_di_Vengerberg_79656e6e65666572.json"],
    "Succube": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_succube_incubo_v3_darkflow_fixed_1776162024602.png", "BESTIARIO/MOSTRI/succube_incubo.webp", "Succube_&_Incubo_7ed094f23185bc6a.json"],
    "Triss": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_triss_merigold_v3_darkflow_fixed_1776162040854.png", "BESTIARIO/PNG/triss_merigold.webp", "Triss_7472697373616d65.json"],
    "Letho": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_letho_gulet_v3_darkflow_fixed_1776162055956.png", "BESTIARIO/PNG/letho_di_gulet.webp", "Letho_6c6574686f67756c.json"]
}

for name, params in ARTIFACTS.items():
    try:
        process_asset(params[0], params[1], params[2])
    except Exception as e:
        print(f"Errore su {name}: {e}")
