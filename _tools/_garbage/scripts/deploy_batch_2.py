from process_ai_assets import process_asset

# Percorsi Artifact Batch 2
ARTIFACTS = {
    "Ciri": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_ciri_v2_darkflow_fixed_1776162103040.png", "BESTIARIO/PNG/ciri.webp", None], # No exact JSON found in top list, but likely exists
    "Ranuncolo": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_ranuncolo_v3_darkflow_fixed_1776162114776.png", "BESTIARIO/PNG/ranuncolo.webp", "Ranuncolo_72616a6e756e636f6c.json"]
}

# Add Dandelion (same as Ranuncolo but different JSON potentially)
ARTIFACTS["Dandelion"] = [ARTIFACTS["Ranuncolo"][0], "BESTIARIO/PNG/dandelion.webp", "Dandelion_Flagello_di_Draghi_l1ibpsdpaspcdzaq.json"]

for name, params in ARTIFACTS.items():
    try:
        process_asset(params[0], params[1], params[2])
    except Exception as e:
        print(f"Errore su {name}: {e}")
