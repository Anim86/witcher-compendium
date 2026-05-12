import os

file_path = 'TheWitcherItaNewSystem/styles/character/sheet.css'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('.application.sheet.witcher.actor {', '.application.sheet.witcher.actor.monster-v2 {')
content = content.replace('.application.sheet.witcher.actor ', '.application.sheet.witcher.actor.monster-v2 ')
content = content.replace('.character-v2', '.monster-v2')
content = content.replace('background: #0d1217 url("../../assets/images/setup_bg.jpg") no-repeat center center fixed !important;', 'background: #0d1217 !important;')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
