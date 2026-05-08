import os
import re

scratch_dir = r"e:\AntigravitiProgetti\CompendioTheWitcher\scratch"
files = [f for f in os.listdir(scratch_dir) if f.startswith("prompts_batch_") and f.endswith(".html")]

batch_pattern = re.compile(r"prompts_batch_(\d+)\.html")
name_pattern = re.compile(r'<div class="name">([^<]+)</div>')

batch_data = {}

for file in files:
    match = batch_pattern.match(file)
    if match:
        batch_num = int(match.group(1))
        if batch_num >= 54:
            with open(os.path.join(scratch_dir, file), 'r', encoding='utf-8') as f:
                content = f.read()
                names = name_pattern.findall(content)
                batch_data[batch_num] = names

output_file = r"e:\AntigravitiProgetti\CompendioTheWitcher\scratch\all_batches_names.txt"
with open(output_file, 'w', encoding='utf-8') as out:
    for batch_num in sorted(batch_data.keys()):
        out.write(f"--- BATCH {batch_num} ---\n")
        for name in batch_data[batch_num]:
            out.write(f"{name} -\n")
        out.write("\n")

