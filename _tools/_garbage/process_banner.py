import sys
import os
from PIL import Image

def process_banner(src_path, dest_path):
    if not os.path.exists(src_path):
        print(f"Error: Source file {src_path} not found.")
        sys.exit(1)
        
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    try:
        with Image.open(src_path) as img:
            w, h = img.size
            target_w = 900
            target_h = 250
            
            img_ratio = w / h
            target_ratio = target_w / target_h
            
            if img_ratio > target_ratio:
                # Image is wider than target aspect ratio -> crop width
                new_w = int(h * target_ratio)
                offset = (w - new_w) // 2
                img = img.crop((offset, 0, offset + new_w, h))
            elif img_ratio < target_ratio:
                # Image is taller than target aspect ratio -> crop height
                new_h = int(w / target_ratio)
                offset = (h - new_h) // 2
                img = img.crop((0, offset, w, offset + new_h))
                
            img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
            img.save(dest_path, "WEBP", quality=85)
            print(f"Successfully processed {src_path} -> {dest_path}")
    except Exception as e:
        print(f"Error processing image: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_banner.py <src_path> <dest_path>")
        sys.exit(1)
    process_banner(sys.argv[1], sys.argv[2])
