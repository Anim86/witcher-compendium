import re

with open('e:/AntigravitiProgetti/CompendioTheWitcher/scratch/prompts_batch_59.html', 'r', encoding='utf-8') as f:
    html = f.read()

items = re.findall(r'<div class="item">.*?</div>\s*(?=<div class="item"|</body>|<script)', html, re.DOTALL)
if not items:
    items = re.findall(r'<div class="item">.*?</div>', html, re.DOTALL)

for item in items:
    name_match = re.search(r'Nome file: <strong>(.*?)</strong>', item)
    path_match = re.search(r'Salva in: (.*?)</div>', item)
    prompt_match = re.search(r'<div class="prompt-box"[^>]*>(.*?)</div>', item)
    
    if name_match and path_match and prompt_match:
        print(f'{name_match.group(1)}|{path_match.group(1)}|{prompt_match.group(1)}')
