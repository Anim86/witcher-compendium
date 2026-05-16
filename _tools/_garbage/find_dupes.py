import json
from collections import Counter

def find_duplicates(data, path=""):
    keys = []
    if isinstance(data, dict):
        for k, v in data.items():
            full_path = f"{path}.{k}" if path else k
            keys.append(full_path)
            keys.extend(find_duplicates(v, full_path))
    elif isinstance(data, list):
        for i, v in enumerate(data):
            keys.extend(find_duplicates(v, f"{path}[{i}]"))
    return keys

# Since standard json parser ignores duplicates, we need a custom one or just regex
import re

with open('TheWitcherItaNewSystem/lang/it.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Simple regex to find keys at same level
# This is hard because of nesting.
# Let's just find ALL keys and their full paths manually.

def get_keys_with_nesting(content):
    # This is a bit complex for a one-liner.
    # Let's try to just find duplicate keys at ANY level first.
    keys = re.findall(r'"([^"]+)"\s*:', content)
    return keys

keys = get_keys_with_nesting(content)
counts = Counter(keys)
duplicates = [k for k, v in counts.items() if v > 1]

for d in duplicates:
    print(f"Duplicate key: {d} (occurs {counts[d]} times)")
