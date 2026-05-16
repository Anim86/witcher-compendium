
import xml.etree.ElementTree as ET
import os

XML_FILES = [
    r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\raw-data\Bestiario.xml",
    r"c:\Users\apaci\Desktop\Script\witcher-compendium-main\_tools\raw-data\BestiarioDW.xml"
]

for xml_path in XML_FILES:
    print(f"\n--- {os.path.basename(xml_path)} ---")
    if not os.path.exists(xml_path):
        print("File not found")
        continue
    tree = ET.parse(xml_path)
    root = tree.getroot()
    for monster in root.findall("SchedaMostro"):
        name = monster.find("Nome").text
        print(name)
