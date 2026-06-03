import os

assets_dir = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\witcher-compendium\assets"
search_terms = ["vampiro", "denti", "dente", "penne", "penna", "corno", "corna", "occhio", "occhi"]

results = []
for root, dirs, files in os.walk(assets_dir):
    for file in files:
        if any(term in file.lower() for term in search_terms):
            results.append(os.path.join(root, file))

print(f"Found {len(results)} matching asset files:")
for res in sorted(results):
    # Print relative to assets_dir
    rel = os.path.relpath(res, assets_dir)
    print(f" - {rel}")
