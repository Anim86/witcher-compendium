import os

def check_bom(filepath):
    with open(filepath, 'rb') as f:
        bytes = f.read(3)
        if bytes == b'\xef\xbb\xbf':
            print(f"{filepath} has UTF-8 BOM")
            return True
        else:
            print(f"{filepath} does not have BOM: {bytes.hex()}")
            return False

def remove_bom(filepath):
    if check_bom(filepath):
        with open(filepath, 'rb') as f:
            content = f.read()
        with open(filepath, 'wb') as f:
            f.write(content[3:])
        print(f"Removed BOM from {filepath}")

paths = [
    'TheWitcherItaNewSystem/lang/it.json',
    'TheWitcherItaNewSystem/lang/en.json',
    'TheWitcherItaNewSystem/system.json',
    'witcher-compendium/module.json',
    'witcher-compendium/languages/it.json'
]

for p in paths:
    if os.path.exists(p):
        remove_bom(p)
