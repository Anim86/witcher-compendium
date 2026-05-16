import fs from 'fs';
import path from 'path';

const SRC_ROOT = 'c:/Users/apaci/Desktop/Script/witcher-compendium-main/_tools/src-packs/BESTIARIO';
const ASSETS_BASE = 'modules/witcher-compendium/assets/BESTIARIO';

const categories = [
    { dir: 'witcher-monsters', assetDir: 'witcher-monsters' },
    { dir: 'witcher-animals', assetDir: 'witcher-animals' },
    { dir: 'witcher-characters', assetDir: 'witcher-characters' }
];

categories.forEach(cat => {
    const fullDir = path.join(SRC_ROOT, cat.dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
        const filePath = path.join(fullDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Fix image path
        const fileName = data.name.toLowerCase().replace(/ /g, '_').replace(/'/g, '').replace(/&/g, '').replace(/__/g, '_');
        
        let ext = data.img ? path.extname(data.img).toLowerCase() : '.webp';
        if (ext === '') ext = '.webp';

        // Check reality check for assets
        const assetsDir = `c:/Users/apaci/Desktop/Script/witcher-compendium-main/witcher-compendium/assets/BESTIARIO/${cat.assetDir}`;
        if (fs.existsSync(path.join(assetsDir, fileName + '.png'))) ext = '.png';
        else if (fs.existsSync(path.join(assetsDir, fileName + '.webp'))) ext = '.webp';

        data.img = `${ASSETS_BASE}/${cat.assetDir}/${fileName}${ext}`;
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    });
    console.log(`Processed ${files.length} files in ${cat.dir}`);
});
