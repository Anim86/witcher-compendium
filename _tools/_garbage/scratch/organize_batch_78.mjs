import fs from 'fs';
import path from 'path';

const tempImagesDir = path.join(process.cwd(), 'temp_images');

// Create subdirectories if they don't exist
const equipDir = path.join(tempImagesDir, 'witcher-equipment');
const alchemyDir = path.join(tempImagesDir, 'witcher-alchemy');

if (!fs.existsSync(equipDir)) fs.mkdirSync(equipDir, { recursive: true });
if (!fs.existsSync(alchemyDir)) fs.mkdirSync(alchemyDir, { recursive: true });

const files = fs.readdirSync(tempImagesDir);

for (const file of files) {
    if (file.endsWith('.png')) {
        let newName = file
            .replace(/_ex_\d+/g, '')
            .replace(/_wp_/g, '')
            .replace(/_dec_/g, '');
            
        const srcPath = path.join(tempImagesDir, file);
        
        if (file.startsWith('Anti-')) {
            const destPath = path.join(equipDir, newName);
            fs.renameSync(srcPath, destPath);
            console.log(`Moved ${file} -> witcher-equipment/${newName}`);
        } else if (file.startsWith('Formula_')) {
            const destPath = path.join(alchemyDir, newName);
            fs.renameSync(srcPath, destPath);
            console.log(`Moved ${file} -> witcher-alchemy/${newName}`);
        }
    }
}
console.log("Renaming and sorting completed.");
