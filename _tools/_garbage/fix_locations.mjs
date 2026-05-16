import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/EQUIPAGGIAMENTO/witcher-armor/';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (file.endsWith('.json')) {
        const filePath = path.join(dir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (Array.isArray(data.system.location)) {
            console.log(`Updating ${file}: ${JSON.stringify(data.system.location)} -> ${data.system.location[0]}`);
            data.system.location = data.system.location[0];
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        }
    }
});
