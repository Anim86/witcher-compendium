import json
import os
import glob
import shutil

base_dir = "e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium"

# Rinomina cartelle tornando a witcher-races e witcher-professions
ag_races = os.path.join(base_dir, "src-packs", "ag-witcher-races")
ag_profs = os.path.join(base_dir, "src-packs", "ag-witcher-professions")
races_dir = os.path.join(base_dir, "src-packs", "witcher-races")
profs_dir = os.path.join(base_dir, "src-packs", "witcher-professions")

if os.path.exists(ag_races):
    os.rename(ag_races, races_dir)

if os.path.exists(ag_profs):
    os.rename(ag_profs, profs_dir)

def refactor_races():
    for file_path in glob.glob(os.path.join(races_dir, "*.json")):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        system = data.get("system", {})
        for i in range(1, 5):
            perk_key = f"perk{i}"
            if perk_key in system:
                # Se c'è 'value', convertilo in 'description'
                if "value" in system[perk_key]:
                    system[perk_key]["description"] = system[perk_key].pop("value")
                    print(f"Fixato {perk_key} in {file_path}")
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

def refactor_professions():
    for file_path in glob.glob(os.path.join(profs_dir, "*.json")):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        system = data.get("system", {})
        if "definingSkill" in system and "value" in system["definingSkill"]:
            system["definingSkill"]["definition"] = system["definingSkill"].pop("value")
            print(f"Fixato definingSkill in {file_path}")
            
        for i in range(1, 4):
            path_key = f"skillPath{i}"
            if path_key in system:
                for j in range(1, 4):
                    skill_key = f"skill{j}"
                    if skill_key in system[path_key] and "value" in system[path_key][skill_key]:
                        system[path_key][skill_key]["definition"] = system[path_key][skill_key].pop("value")
                        print(f"Fixato {path_key}.{skill_key} in {file_path}")
                        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

print("Iniziando il refactoring dello schema (round 8)...")
refactor_races()
refactor_professions()
print("Completo.")
