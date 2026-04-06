import json
import os
import glob

def refactor_races():
    base_dir = "e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/src-packs/witcher-races"
    for file_path in glob.glob(os.path.join(base_dir, "*.json")):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        system = data.get("system", {})
        for i in range(1, 5):
            perk_key = f"perk{i}"
            if perk_key in system:
                if "value" in system[perk_key]:
                    system[perk_key]["description"] = system[perk_key].pop("value")
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

def refactor_professions():
    base_dir = "e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/src-packs/witcher-professions"
    for file_path in glob.glob(os.path.join(base_dir, "*.json")):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        system = data.get("system", {})
        if "definingSkill" in system and "value" in system["definingSkill"]:
            system["definingSkill"]["definition"] = system["definingSkill"].pop("value")
            
        for i in range(1, 4):
            path_key = f"skillPath{i}"
            if path_key in system:
                for j in range(1, 4):
                    skill_key = f"skill{j}"
                    if skill_key in system[path_key] and "value" in system[path_key][skill_key]:
                        system[path_key][skill_key]["definition"] = system[path_key][skill_key].pop("value")
                        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

print("Iniziando il refactoring...")
refactor_races()
print("Razze completate.")
refactor_professions()
print("Professioni completate.")
