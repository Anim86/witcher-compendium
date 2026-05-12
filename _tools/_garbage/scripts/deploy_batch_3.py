from process_ai_assets import process_asset

# Percorsi Artifact Batch 3 (Mostri)
ARTIFACTS = {
    "Scagnozzi": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_scagnozzi_mawik_v1_darkflow_1776165201252.png", "BESTIARIO/MOSTRI/scagnozzi_di_mawik.webp", "scagnozzi_di_mawik_1740ab0681735b56.json"],
    "Silvano": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_silvano_v1_darkflow_1776165216986.png", "BESTIARIO/MOSTRI/silvano_oberhasil.webp", "Silvano_Oberhasil_ss9sa7rtjgdc58bx.json"],
    "Bies": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_bies_v1_darkflow_1776165236853.png", "BESTIARIO/MOSTRI/bies.webp", None], # Need to find the exact JSON
    "Leshen": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_leshen_v2_darkflow_fixed_1776165256839.png", "BESTIARIO/MOSTRI/leshen.webp", None],
    "Foglet": [r"C:\Users\apaci\.gemini\antigravity\brain\ac42c924-802e-4dce-b8ff-b89d774b0013\icon_monster_foglet_v2_darkflow_fixed_1776165273503.png", "BESTIARIO/MOSTRI/foglet.webp", None]
}

# Cultista will be added if successful
# "Cultista": [r"...", "BESTIARIO/MOSTRI/cultista_del_coram_agh_tera.webp", "cultista_del_coram_agh_tera_418c67ecf457abcb.json"]

for name, params in ARTIFACTS.items():
    try:
        process_asset(params[0], params[1], params[2])
    except Exception as e:
        print(f"Errore su {name}: {e}")
