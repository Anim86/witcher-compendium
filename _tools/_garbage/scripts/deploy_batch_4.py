from process_ai_assets import process_asset

# Batch 4 - Mostri (Parte 1) - Corretto
ARTIFACTS = {
    "Drowner": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_drowner_v1_darkflow_1776165363042.png", "BESTIARIO/MOSTRI/drowner.webp", "Drowner_9597d81f6d124efa.json"],
    "Arachas": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_arachas_v2_darkflow_fixed_1776165383181.png", "BESTIARIO/MOSTRI/arachas.webp", "Arachas_121e9ba4fc214734.json"],
    "Arpia": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_arpia_v2_darkflow_fixed_1776165399464.png", "BESTIARIO/MOSTRI/arpia.webp", "Arpia_1e728fda490563cb.json"]
}

for name, params in ARTIFACTS.items():
    try:
        process_asset(params[0], params[1], params[2])
    except Exception as e:
        print(f"Errore su {name}: {e}")
