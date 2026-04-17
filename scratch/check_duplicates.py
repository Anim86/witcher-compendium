import json
import os

def find_duplicates(file_path):
    print(f"Checking {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = f.read()

    def handle_duplicates(ordered_pairs):
        d = {}
        for k, v in ordered_pairs:
            if k in d:
                print(f"Duplicate key found: {k}")
            d[k] = v
        return d

    try:
        json.loads(data, object_pairs_hook=handle_duplicates)
    except Exception as e:
        print(f"Error parsing JSON: {e}")

lang_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\TheWitcherItaNewSystem\lang"
find_duplicates(os.path.join(lang_dir, 'it.json'))
find_duplicates(os.path.join(lang_dir, 'en.json'))
