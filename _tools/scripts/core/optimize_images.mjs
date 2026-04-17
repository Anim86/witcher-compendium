// Witcher Compendium Maintenance Tool: Image Optimizer
// VERSION: 1.0.0
// LAST_UPDATE: 2026-04-14
// DESCRIPTION: Batches optimizes images referenced in a text file, converting to WebP and resizing.

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this script's new home in _tools/scripts/core
const REPO_ROOT = path.resolve(__dirname, '../../../');
const REFERENCED_FILES_PATH = path.join(REPO_ROOT, 'tmp', 'referenced_images.txt');
const BASE_DIR = REPO_ROOT;
const OPTIMIZED_BASE = path.join(REPO_ROOT, 'witcher-compendium', 'assets', 'optimized');

async function main() {
    if (!fs.existsSync(OPTIMIZED_BASE)) {
        fs.mkdirSync(OPTIMIZED_BASE, { recursive: true });
    }

    if (!fs.existsSync(REFERENCED_FILES_PATH)) {
        console.error(`❌ Referenced files list not found at: ${REFERENCED_FILES_PATH}`);
        process.exit(1);
    }

    const data = fs.readFileSync(REFERENCED_FILES_PATH, 'utf8');
    const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');

    console.log(`🚀 Found ${lines.length} references to process.`);

    for (const line of lines) {
        if (line.endsWith('.svg')) continue;

        const sourceRelativePath = line.replace('modules/witcher-compendium/', 'witcher-compendium/');
        const sourceFullPath = path.resolve(BASE_DIR, sourceRelativePath);

        if (!fs.existsSync(sourceFullPath)) continue;

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
                
            console.log(`  ✅ Done: ${destFullPath}`);
        } catch (err) {
            console.error(`  ❌ Error processing ${sourceRelativePath}:`, err.message);
        }
    }
}

main().catch(console.error);
