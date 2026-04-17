import os
import re

base_path = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\images"

def rename_images():
    count = 0
    files = [f for f in os.listdir(base_path) if f.endswith(".webp")]
    
    for filename in files:
        # Expected pattern: PagXXX_Name_01.webp
        parts = filename.split("_")
        
        if len(parts) >= 3:
            # The name is the second part
            name_part = parts[1]
            # Replace spaces with underscores
            new_name = name_part.replace(" ", "_").strip()
            # Ensure it ends with .webp
            final_filename = f"{new_name}.webp"
            
            old_path = os.path.join(base_path, filename)
            new_path = os.path.join(base_path, final_filename)
            
            if os.path.exists(new_path):
                print(f"Warning: {final_filename} already exists, skipping {filename}")
            else:
                os.rename(old_path, new_path)
                print(f"Renamed: {filename} -> {final_filename}")
                count += 1
        else:
            print(f"Skipping {filename}: does not match PagXXX_Name_XXX pattern")

    print(f"\nTotal images renamed: {count}")

if __name__ == "__main__":
    rename_images()
