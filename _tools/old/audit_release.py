import json
import os

# Paths
SRC_ROOT = "../src-packs"

def audit_record(data):
    errors = []
    name = data.get("name", "Unknown")
    
    # 1. Check for Missing IDs
    if not data.get("_id"): errors.append("Missing ID")
    
    # 2. Check for empty descriptions
    system = data.get("system", {})
    desc = system.get("description", "")
    effect = system.get("effect", "")
    notes = system.get("notes", [])
    
    if not desc and not effect and not notes:
        errors.append("Empty narrative content (desc/effect/notes)")
        
    # 3. Check for specific Actor stats
    if data.get("type") == "monster":
        if not system.get("stats"): errors.append("Missing stats")
        if not system.get("derivedStats"): errors.append("Missing derivedStats")
        
    # 4. Check for SourceBook
    if not system.get("sourcebook"):
        errors.append("Missing sourcebook reference")
        
    return errors

def main():
    report = []
    total_files = 0
    total_errors = 0
    
    for root, dirs, files in os.walk(SRC_ROOT):
        for file in files:
            if not file.endswith('.json'): continue
            total_files += 1
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            errors = audit_record(data)
            if errors:
                total_errors += len(errors)
                report.append(f"[{file}] {data.get('name')}: {', '.join(errors)}")

    print(f"Final Release Audit (v1.0.0):")
    print(f"Files Audited: {total_files}")
    print(f"Total Warnings: {total_errors}")
    
    with open("audit-release-1.0.0.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(report))
    print(f"Audit report saved to 'audit-release-1.0.0.txt'")

if __name__ == "__main__":
    main()

