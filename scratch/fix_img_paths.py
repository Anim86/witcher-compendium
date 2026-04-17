import os
import re

root_dir = r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs'

def fix_img_paths():
    count = 0
    # Pattern to match "img": "assets/..." but NOT "img": "modules/witcher-compendium/assets/..."
    # Also handles "img": "/assets/..."
    pattern = re.compile(r'"img":\s*"(/?assets/[^"]+)"')
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.json'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    def replacer(match):
                        p = match.group(1)
                        if p.startswith('/'):
                            p = p[1:]
                        return f'"img": "modules/witcher-compendium/{p}"'
                    
                    new_content = pattern.sub(replacer, content)
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8', newline='\n') as f:
                            f.write(new_content)
                        count += 1
                        print(f"Fixed: {path}")
                except Exception as e:
                    print(f"Error processing {path}: {e}")
                    
    print(f"\nFinished! Fixed {count} files.")

if __name__ == "__main__":
    fix_img_paths()
