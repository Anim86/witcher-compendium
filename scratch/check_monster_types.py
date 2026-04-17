import os
import json

base_path = r'c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\src-packs\BESTIARIO\MOSTRI'
valid_types = [
    'Humanoid', 'Necrophage', 'Specter', 'Beast', 'CursedOne', 
    'Hybrid', 'Insectoid', 'Elementa', 'Relict', 'Ogroid', 
    'Draconid', 'Vampire'
]

report = []
missing_count = 0
invalid_count = 0
correct_count = 0

for filename in os.listdir(base_path):
    if filename.endswith('.json'):
        file_path = os.path.join(base_path, filename)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            monster_name = data.get('name', filename)
            system = data.get('system', {})
            details = system.get('details', {})
            m_type = details.get('monsterType')
            
            if not m_type:
                report.append({
                    'name': monster_name,
                    'file': filename,
                    'status': 'MISSING',
                    'current': None
                })
                missing_count += 1
            elif m_type not in valid_types:
                report.append({
                    'name': monster_name,
                    'file': filename,
                    'status': 'INVALID',
                    'current': m_type
                })
                invalid_count += 1
            else:
                correct_count += 1
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")

# Output report as markdown
markdown_report = "# Monster Type Mapping Report\n\n"
markdown_report += f"**Summary:**\n- Correctly Mapped: {correct_count}\n- Missing Type: {missing_count}\n- Invalid Type (not in config): {invalid_count}\n\n"

if missing_count > 0:
    markdown_report += "## Missing Type\n"
    markdown_report += "| Monster Name | Filename |\n"
    markdown_report += "| :--- | :--- |\n"
    for item in report:
        if item['status'] == 'MISSING':
            markdown_report += f"| {item['name']} | [{item['file']}](file:///{os.path.join(base_path, item['file']).replace('\\', '/')}) |\n"

if invalid_count > 0:
    markdown_report += "\n## Invalid Type (needs fixing)\n"
    markdown_report += "| Monster Name | Filename | Current Value |\n"
    markdown_report += "| :--- | :--- | :--- |\n"
    for item in report:
        if item['status'] == 'INVALID':
            markdown_report += f"| {item['name']} | [{item['file']}](file:///{os.path.join(base_path, item['file']).replace('\\', '/')}) | {item['current']} |\n"

print(markdown_report)

with open('monster_report.md', 'w', encoding='utf-8') as f:
    f.write(markdown_report)
