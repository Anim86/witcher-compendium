import json
import os

def compile_pack(src_dir, dest_file):
    if not os.path.exists(src_dir):
        print(f"Directory {src_dir} not found.")
        return
    
    files = [f for f in os.listdir(src_dir) if f.endswith('.json')]
    entries = []
    
    for file in files:
        with open(os.path.join(src_dir, file), 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                # Ensure it's a single line string
                entries.append(json.dumps(data, ensure_ascii=False))
            except Exception as e:
                print(f"Error parsing {file}: {e}")
                
    with open(dest_file, 'w', encoding='utf-8') as out:
        out.write('\n'.join(entries))
    print(f"Successfully compiled {len(entries)} entries to {dest_file}")

def main():
    base_dir = "e:/AntigravitiProgetti/CompendioTheWitcher/witcher-compendium/"
    src_root = os.path.join(base_dir, "src-packs")
    dest_root = os.path.join(base_dir, "packs")
    
    if not os.path.exists(dest_root):
        os.makedirs(dest_root)
        
    packs = [d for d in os.listdir(src_root) if os.path.isdir(os.path.join(src_root, d))]
    
    for pack in packs:
        src = os.path.join(src_root, pack)
        dest = os.path.join(dest_root, f"{pack}.db")
        compile_pack(src, dest)

if __name__ == "__main__":
    main()
