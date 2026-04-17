import os
import json

ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
SRC_PACKS = os.path.join(ROOT, "_tools", "src-packs")
MODULE_ROOT = os.path.join(ROOT, "witcher-compendium")

def audit_broken_images():
    report = []
    broken_count = 0
    total_count = 0

    for root, dirs, files in os.walk(SRC_PACKS):
        for f in files:
            if f.endswith(".json"):
                total_count += 1
                path = os.path.join(root, f)
                try:
                    with open(path, 'r', encoding='utf-8-sig') as jf:
                        data = json.load(jf)
                        img = data.get("img", "")
                        
                        if not img:
                            continue
                            
                        # Standard image paths start with modules/witcher-compendium/
                        # We need to map this to the physical path on disk
                        physical_path = img.replace("modules/witcher-compendium/", "")
                        full_physical_path = os.path.join(MODULE_ROOT, physical_path.replace("/", "\\"))
                        
                        if not os.path.exists(full_physical_path):
                            broken_count += 1
                            report.append({
                                "name": data.get("name", "Unknown"),
                                "pack": os.path.basename(root),
                                "img_path": img,
                                "json_file": path
                            })
                except Exception as e:
                    print(f"Error reading {path}: {e}")

    return report, broken_count, total_count

if __name__ == "__main__":
    report, broken, total = audit_broken_images()
    
    print(f"--- AUDIT REPORT ---")
    print(f"Total JSONs analyzed: {total}")
    print(f"Broken images found:  {broken}")
    print("-" * 30)
    
    # Group by pack for readability
    packs = {}
    for item in report:
        p = item["pack"]
        if p not in packs: packs[p] = []
        packs[p].append(item)
        
    for pack, items in packs.items():
        print(f"\n[PACK: {pack}]")
        for item in items[:10]: # Show first 10 for brevety
            print(f"  - {item['name']} (Expected: {item['img_path']})")
        if len(items) > 10:
            print(f"  ... and {len(items)-10} more.")
            
    # Save full report
    with open(os.path.join(ROOT, "_tools", "broken_images_audit.json"), 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=4)
