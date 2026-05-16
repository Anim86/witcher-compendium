import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { slugify, getFiles } from './core/utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../');
const SRC_PACKS_DIR = path.join(REPO_ROOT, '_tools/src-packs');
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium/assets');

const PLACEHOLDER_SIZE = 17144;

/**
 * Normalizes a string using the old logic (removing apostrophes).
 * Used to find files that need renaming.
 */
function legacySlugify(text) {
    if (!text) return "";
    return text.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^\w-]+/g, '')
        .replace(/__+/g, '_')
        .replace(/^_|_$/g, '');
}

function fixAssets() {
    console.log("🛠️  Fixing asset filenames to match new slugify standard...");

    // 1. Build a map of existing assets in each folder
    const allAssetFiles = getFiles(ASSETS_ROOT, (f) => f.match(/\.(webp|png|jpg)$/i));
    
    // 2. Walk through all JSON files
    const jsonFiles = getFiles(SRC_PACKS_DIR, (f) => f.endsWith('.json'));

    let renameCount = 0;
    let deleteCount = 0;

    jsonFiles.forEach(fpath => {
        try {
            let content = fs.readFileSync(fpath, 'utf8');
            if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
            const data = JSON.parse(content);

            if (!data.img || !data.name) return;

            const relPathInJson = data.img.replace("modules/witcher-compendium/assets/", "");
            const targetAbsPath = path.join(ASSETS_ROOT, relPathInJson);
            const targetDir = path.dirname(targetAbsPath);
            const targetFilename = path.basename(targetAbsPath);
            const targetBase = path.basename(targetFilename, path.extname(targetFilename));

            // If the target file already exists, check if it's a placeholder
            if (fs.existsSync(targetAbsPath)) {
                const stat = fs.statSync(targetAbsPath);
                if (stat.size === PLACEHOLDER_SIZE) {
                    // It's a placeholder. We might want to replace it if we find a better version.
                    // For now, just keep track.
                } else {
                    // Correct file already exists.
                    return;
                }
            }

            // Look for potential matches in the same directory
            if (!fs.existsSync(targetDir)) return;

            const siblingFiles = fs.readdirSync(targetDir);
            
            // Potential suffixes to strip
            const suffixes = ['_wp_', '_wo_', '_dec_', '_ex_1', '_ex_2', '_ex_3', '_ex_4', '_ex_5', '_ex_6', '_ex_7', '_ex_8', '_ex_9', '_ex_10'];
            
            let foundMatch = false;

            for (const file of siblingFiles) {
                const ext = path.extname(file);
                if (!['.webp', '.png', '.jpg'].includes(ext.toLowerCase())) continue;
                
                const base = path.basename(file, ext).toLowerCase();
                const fullSiblingPath = path.join(targetDir, file);
                
                // Skip if it's a placeholder
                const stat = fs.statSync(fullSiblingPath);
                if (stat.size === PLACEHOLDER_SIZE) continue;

                // Match 1: Legacy slug
                const isLegacyMatch = legacySlugify(data.name) === base;
                
                // Match 2: Name with suffix
                let isSuffixMatch = false;
                for (const s of suffixes) {
                    if (base === (targetBase + s) || base === (legacySlugify(data.name) + s)) {
                        isSuffixMatch = true;
                        break;
                    }
                }

                // Match 3: Simple case-insensitive match (should be handled by lowercase_assets but just in case)
                const isSimpleMatch = base === targetBase;

                if (isLegacyMatch || isSuffixMatch || isSimpleMatch) {
                    // Check if we should rename
                    if (fullSiblingPath !== targetAbsPath) {
                        // If target exists and is placeholder, delete it first
                        if (fs.existsSync(targetAbsPath)) {
                            fs.unlinkSync(targetAbsPath);
                            deleteCount++;
                        }
                        
                        fs.renameSync(fullSiblingPath, targetAbsPath);
                        console.log(`✅ Fixed: ${file} -> ${targetFilename}`);
                        renameCount++;
                        foundMatch = true;
                        break;
                    }
                }
            }
        } catch (e) {
            console.error(`Error on ${fpath}: ${e.message}`);
        }
    });

    // 3. Final cleanup: Delete any remaining placeholders that are in the way of correct files
    // (Already handled above for direct matches)

    console.log(`\n✨ Done! Renamed ${renameCount} files, deleted ${deleteCount} placeholders.`);
}

fixAssets();
