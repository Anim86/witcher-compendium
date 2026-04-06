import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const REFERENCED_FILES_PATH = '../../tmp/referenced_images.txt';
const BASE_DIR = '../../';
const OPTIMIZED_BASE = '../../witcher-compendium/assets/optimized';

async function main() {
    if (!fs.existsSync(OPTIMIZED_BASE)) {
        fs.mkdirSync(OPTIMIZED_BASE, { recursive: true });
    }

    const data = fs.readFileSync(REFERENCED_FILES_PATH, 'utf8');
    const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');

    console.log(`Found ${lines.length} references to process.`);

    for (const line of lines) {
        if (line.endsWith('.svg')) {
            // console.log(`Skipping SVG: ${line}`);
            continue;
        }

        const sourceRelativePath = line.replace('modules/witcher-compendium/', 'witcher-compendium/');
        const sourceFullPath = path.resolve(BASE_DIR, sourceRelativePath);

        if (!fs.existsSync(sourceFullPath)) {
            // console.warn(`Source file not found: ${sourceFullPath}`);
            continue;
        }

        const pathParts = sourceRelativePath.split('/');
        pathParts.shift(); // remove 'witcher-compendium'
        const destRelativePath = pathParts.join('/').replace(/\.(png|jpg|jpeg)$/i, '.webp');
        const destFullPath = path.join(OPTIMIZED_BASE, destRelativePath);

        const destDir = path.dirname(destFullPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        try {
            console.log(`Processing: ${sourceRelativePath} -> ${destRelativePath}`);
            await sharp(sourceFullPath)
                .resize({
                    width: 1024,
                    height: 1024,
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 80 })
                .toFile(destFullPath);
                
            console.log(`  Done: ${destFullPath}`);
        } catch (err) {
            console.error(`  Error processing ${sourceRelativePath}:`, err);
        }
    }
}

main().catch(console.error);
