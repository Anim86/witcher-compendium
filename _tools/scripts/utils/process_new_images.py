import os
import re
import json
import shutil
from PIL import Image

# Paths
ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
TEMP_DIR = os.path.join(ROOT, "temp_images")
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")
ASSETS_DIR = os.path.join(ROOT, "witcher-compendium", "assets")
NPC_ASSETS = os.path.join(ASSETS_DIR, "BESTIARIO", "PNG")
LORE_ASSETS = os.path.join(ASSETS_DIR, "LORE", "base", "witcher-lore")

# Regex for cleanup: Pag154_L154_Artorius Vigo_01.png -> Artorius Vigo
CLEAN_RE = re.compile(r"Pag\d+_L\d+_(.+?)_\d+\.png")

def normalize_name(name):
    return name.strip().lower().replace(" ", "_").replace(".", "").replace("'", "_")

def process():
    if not os.path.exists(TEMP_DIR):
        print(f"Directory {TEMP_DIR} not found.")
        return

    # Create target directories
    os.makedirs(NPC_ASSETS, exist_ok=True)
    os.makedirs(LORE_ASSETS, exist_ok=True)

    files = os.listdir(TEMP_DIR)
    results = {
        "mapped": [],
        "failed": [],
        "errors": []
    }

    # Inventory of JSONs
    json_inventory = []
    print("Reading compendium inventory (using utf-8-sig)...")
    for root, _, filenames in os.walk(SRC_PACKS):
        for f in filenames:
            if f.endswith(".json"):
                json_path = os.path.join(root, f)
                try:
                    # Use utf-8-sig to handle BOM
                    with open(json_path, 'r', encoding='utf-8-sig') as jf:
                        data = json.load(jf)
                        json_inventory.append({
                            "path": json_path,
                            "name": data.get("name", ""),
                            "normalized": normalize_name(data.get("name", "")),
                            "type": data.get("type", "")
                        })
                except Exception as e:
                    print(f"Error reading {json_path}: {e}")

    for f in files:
        if not f.lower().endswith(".png"):
            continue

        orig_path = os.path.join(TEMP_DIR, f)
        
        # Cleanup name
        match = CLEAN_RE.match(f)
        if match:
            clean_name = match.group(1)
        else:
            clean_name = os.path.splitext(f)[0]
        
        norm_name = normalize_name(clean_name)
        target_filename = f"{norm_name}.webp"
        
        # Determine target asset folder
        target_item = None
        
        # 1. Try EXACT match
        for item in json_inventory:
            if item["normalized"] == norm_name:
                target_item = item
                break
        
        # 2. Try stricter fuzzy match ONLY if exact failed
        # AND only if it's Not an "item" (weapons etc) to avoid "Elmo di Skellige"
        if not target_item:
            for item in json_inventory:
                if item["type"] in ["note", "npc", "character"]: # Lore or NPCs
                    # Check if the name matches exactly after some minor cleanup
                    if item["normalized"] == norm_name:
                        target_item = item
                        break
        
        # 3. Last resort fuzzy for Lore/NPCs but must be the dominant part
        if not target_item:
            for item in json_inventory:
                if item["type"] in ["note", "npc", "character"]:
                    if norm_name in item["normalized"] and len(norm_name) > len(item["normalized"]) * 0.7:
                        target_item = item
                        break

        if target_item:
            # Asset logic
            if target_item["type"] == "note": # Lore
                asset_subpath = "LORE/base/witcher-lore"
                dest_dir = LORE_ASSETS
            else: # NPC / PNG
                asset_subpath = "BESTIARIO/PNG"
                dest_dir = NPC_ASSETS
            
            dest_path = os.path.join(dest_dir, target_filename)
            rel_asset_path = f"modules/witcher-compendium/assets/{asset_subpath}/{target_filename}"
            
            try:
                # Convert to WebP using Pillow
                img = Image.open(orig_path)
                img.save(dest_path, "WEBP", quality=85)
                
                # Update JSON
                with open(target_item["path"], 'r', encoding='utf-8-sig') as jf:
                    data = json.load(jf)
                
                data["img"] = rel_asset_path
                
                with open(target_item["path"], 'w', encoding='utf-8') as jf:
                    json.dump(data, jf, indent=4, ensure_ascii=False)
                
                results["mapped"].append(f"{f} -> {target_item['name']} ({rel_asset_path})")
                print(f"SUCCESS: {f} mapped to {target_item['name']}")
                
            except Exception as e:
                results["errors"].append(f"Error processing {f}: {e}")
                print(f"ERROR: {f} -> {e}")
        else:
            results["failed"].append(f"Filename: {f} | Clean: {clean_name} | Norm: {norm_name}")
            print(f"FAILED: No match for {f}")

    # Final Report
    report_path = os.path.join(ROOT, "_tools", "image_processing_report.json")
    with open(report_path, 'w', encoding='utf-8') as rf:
        json.dump(results, rf, indent=4)
    
    print("\n--- PROCESSING COMPLETE ---")
    print(f"Mapped: {len(results['mapped'])}")
    print(f"Failed: {len(results['failed'])}")
    processed_failed = [r.split("|")[0].replace("Filename: ", "").strip() for r in results['failed']]
    if processed_failed:
        print("\nItems not linked (these don't have a matching JSON in the compendium):")
        for pf in processed_failed:
            print(f"- {pf}")
    
    print(f"\nDetailed report saved to {report_path}")

if __name__ == "__main__":
    process()
