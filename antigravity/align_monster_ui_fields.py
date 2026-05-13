
import os
import json

dirs = [
    r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-monsters',
    r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\witcher-animals'
]

for d in dirs:
    for filename in os.listdir(d):
        if filename.endswith('.json'):
            path = os.path.join(d, filename)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                sys = data.get('system', {})
                det = sys.get('details', {})
                
                # Biometrics redundancy for different templates
                sys['height'] = sys.get('height') or det.get('height', "")
                sys['weight'] = sys.get('weight') or det.get('weight', "")
                sys['environment'] = sys.get('environment') or det.get('environment', "")
                sys['organization'] = sys.get('organization') or det.get('organization', "")
                sys['intelligence'] = sys.get('intelligence') or det.get('intelligence', "")
                
                det['height'] = sys['height']
                det['weight'] = sys['weight']
                det['environment'] = sys['environment']
                det['organization'] = sys['organization']
                
                # Biography / Description alignment
                bio = det.get('biography', "")
                sys['description'] = bio
                det['biography'] = bio
                
                # Vulnerability
                vuln = sys.get('vulnerability') or det.get('vulnerability', "")
                sys['vulnerability'] = vuln
                det['vulnerability'] = vuln
                
                # Save back
                with open(path, 'w', encoding='utf-8') as out:
                    json.dump(data, out, indent=4, ensure_ascii=False)
                print(f"Aligned: {filename}")
            except Exception as e:
                print(f"Error aligning {filename}: {e}")

print("Final UI Alignment Completed.")
