import os
import json

# Paths
ROOT = r"c:\Users\apaci\Desktop\Script\witcher-compendium-main"
TEMP_DIR = os.path.join(ROOT, "temp_images")
REPORT_PATH = os.path.join(ROOT, "_tools", "image_processing_report.json")

def cleanup():
    if not os.path.exists(REPORT_PATH):
        print(f"Report {REPORT_PATH} not found.")
        return

    with open(REPORT_PATH, 'r', encoding='utf-8') as f:
        report = json.load(f)

    mapped_items = report.get("mapped", [])
    if not mapped_items:
        print("No mapped items found in the report.")
        return

    deleted_count = 0
    for item in mapped_items:
        # Item is in format: "filename.png -> Name (path)"
        orig_filename = item.split(" -> ")[0].strip()
        file_path = os.path.join(TEMP_DIR, orig_filename)
        
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"Deleted: {orig_filename}")
                deleted_count += 1
            except Exception as e:
                print(f"Error deleting {orig_filename}: {e}")
        else:
            print(f"File not found (already deleted?): {orig_filename}")

    print(f"\nCleanup complete. Total files deleted: {deleted_count}")

if __name__ == "__main__":
    cleanup()
