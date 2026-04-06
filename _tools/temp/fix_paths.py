import os
import re

tools_dir = r'C:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools'
scripts_dir = os.path.join(tools_dir, 'scripts')

# Patterns to replace
patterns = [
    (r'witcher-compendium/src-packs', r'../src-packs'),
    (r'witcher-compendium/packs', r'../../witcher-compendium/packs'),
    (r'witcher-compendium/module\.json', r'../../witcher-compendium/module.json'),
    # Also handle the absolute paths found earlier
    (r'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/src-packs', r'../src-packs'),
    (r'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/packs', r'../../witcher-compendium/packs'),
    (r'e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/module\.json', r'../../witcher-compendium/module.json'),
]

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in patterns:
        new_content = re.sub(pattern, replacement, new_content, flags=re.IGNORECASE)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

count = 0
for filename in os.listdir(scripts_dir):
    if filename.endswith(('.py', '.js')):
        path = os.path.join(scripts_dir, filename)
        if fix_file(path):
            print(f"Fixed paths in: {filename}")
            count += 1

print(f"Done. Fixed {count} files.")
