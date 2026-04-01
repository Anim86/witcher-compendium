import json
import os
import re

SRC_ROOT = "witcher-compendium/src-packs"
TEXT_DIRS = ["Tomo Base/Testi", "Tomo del Caos/Testi"]

def clean_text(text):
    if not text: return ""
    text = re.sub(r'Davide Mesina - \d+', '', text)
    text = re.sub(r'Alessandro Pacifico - \d+', '', text)
    text = re.sub(r'--- Pagina \d+ ---', '', text)
    text = re.sub(r'\[Immagini presenti.*?\]', '', text)
    # Remove leading line numbers if any
    text = re.sub(r'^\d+: ', '', text, flags=re.MULTILINE)
    return text.strip()

def reinject():
    # 1. Collect all names
    all_items = []
    for root, dirs, files in os.walk(SRC_ROOT):
        for file in files:
            if not file.endswith('.json'): continue
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            desc = data.get("system", {}).get("description", "")
            if not desc or desc.strip() in ["", "<p></p>"]:
                all_items.append({"path": path, "name": data["name"]})

    print(f"Found {len(all_items)} entries needing descriptions.")

    # 2. Extract descriptions from all TXTs
    # Load all TXT content into a single searchable buffer per book
    txt_buffers = []
    for text_dir in TEXT_DIRS:
        if not os.path.exists(text_dir): continue
        for filename in os.listdir(text_dir):
            if not filename.endswith('.txt'): continue
            with open(os.path.join(text_dir, filename), 'r', encoding='utf-8') as f:
                txt_buffers.append(clean_text(f.read()))
    
    full_text = "\n\n".join(txt_buffers)
    
    fixed_count = 0
    for item in all_items:
        name = item["name"]
        # Search for Name in the buffer
        # Looking for "Name Description" pattern
        # The description usually follows the name and ends with a newline or next item
        
        # Regex to find the name as a standalone word/header
        # Then grab the next 100-500 chars until a clear break
        escaped_name = re.escape(name)
        # Try finding the name at the start of a line or after a space
        pattern = rf'(?:^|\n){escaped_name}\s+([A-Z][\s\S]+?)(?=\n\n|\n[A-Z\s]+---|\n[A-Z]{{3,}}|$)'
        match = re.search(pattern, full_text, re.MULTILINE)
        
        if not match:
            # Try a broader search if the above fails (e.g. name not at start of line)
            pattern = rf'{escaped_name}\s+([A-Z][\s\S]+?)(?=\r?\n\r?\n|\r?\n[A-Z\s]{{5,}}|$)'
            match = re.search(pattern, full_text)

        if match:
            new_desc = match.group(1).strip().replace('\n', ' ')
            if len(new_desc) > 10:
                with open(item["path"], 'r', encoding='utf-8') as f:
                    data = json.load(f)
                data["system"]["description"] = f"<p>{new_desc}</p>"
                with open(item["path"], 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                fixed_count += 1

    print(f"Fixed {fixed_count} / {len(all_items)} remaining entries.")

if __name__ == "__main__":
    reinject()
