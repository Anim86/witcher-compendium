import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to REPO_ROOT
const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_DIR = path.join(REPO_ROOT, '_tools/src-packs/EQUIPAGGIAMENTO/witcher-equipment');
const ASSETS_DIR = path.join(REPO_ROOT, 'witcher-compendium/assets/EQUIPAGGIAMENTO/witcher-equipment');
const BACKUP_EQUIP_DIR = path.join(REPO_ROOT, 'backup_images/witcher-equipment');
const BACKUP_ORPHANS_DIR = path.join(REPO_ROOT, 'backup_images/_review_orphans');

// Slugify function matching Witcher standard
function slugify(text) {
    if (!text) return "";
    return text.toString().toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/['"«»„“”]/g, '_')
        .replace(/[^\w\s-]/g, '_')
        .replace(/[-\s]+/g, '_')
        .replace(/__+/g, '_')
        .replace(/^_|_$/g, '');
}

// Compare two images visually using raw pixel buffers
async function compareImagesVisually(path1, path2) {
    if (!fs.existsSync(path1) || !fs.existsSync(path2)) {
        return { success: false, reason: 'File not found' };
    }
    try {
        const size = 256;
        // Decode and resize both images to raw RGB buffer
        const buf1 = await sharp(path1)
            .resize(size, size, { fit: 'fill' })
            .raw()
            .toBuffer();
            
        const buf2 = await sharp(path2)
            .resize(size, size, { fit: 'fill' })
            .raw()
            .toBuffer();
            
        if (buf1.length !== buf2.length) {
            return { success: false, reason: 'Buffer size mismatch' };
        }
        
        let diff = 0;
        for (let i = 0; i < buf1.length; i++) {
            diff += Math.abs(buf1[i] - buf2[i]);
        }
        
        const mae = diff / buf1.length;
        // A Mean Absolute Error < 6.0 indicates visual identity (taking compression noise into account)
        const isIdentical = mae < 6.0;
        
        return { success: true, mae, isIdentical };
    } catch (e) {
        return { success: false, reason: `Error during processing: ${e.message}` };
    }
}

async function run() {
    console.log("🧪 STARTING MATHEMATICAL IMAGE COMPARISON (Compendium WebP vs Backup PNG)...");
    
    // 1. Gather all JSON files
    const jsonFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.json'));
    
    // 2. Gather backups
    const backupsEquip = fs.existsSync(BACKUP_EQUIP_DIR) ? fs.readdirSync(BACKUP_EQUIP_DIR) : [];
    const backupsOrphans = fs.existsSync(BACKUP_ORPHANS_DIR) ? fs.readdirSync(BACKUP_ORPHANS_DIR) : [];
    
    const backupMap = new Map();
    backupsEquip.forEach(file => {
        const base = path.basename(file, path.extname(file));
        const slug = slugify(base);
        backupMap.set(slug, { source: 'backup_images/witcher-equipment', file, fullPath: path.join(BACKUP_EQUIP_DIR, file) });
    });
    
    backupsOrphans.forEach(file => {
        const base = path.basename(file, path.extname(file));
        const slug = slugify(base);
        if (!backupMap.has(slug)) {
            backupMap.set(slug, { source: 'backup_images/_review_orphans', file, fullPath: path.join(BACKUP_ORPHANS_DIR, file) });
        }
    });

    const results = [];
    let identicalCount = 0;
    let differentCount = 0;
    let errorCount = 0;

    for (const jsonFile of jsonFiles) {
        const jsonPath = path.join(SRC_DIR, jsonFile);
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        const name = data.name;
        const img = data.img || "";
        const filename = img ? path.basename(img) : "";
        const slug = slugify(name);
        
        const activeImagePath = path.join(ASSETS_DIR, filename);
        
        // Find backup candidate
        let backupCandidate = null;
        if (backupMap.has(slug)) {
            backupCandidate = backupMap.get(slug);
        } else {
            for (let [bSlug, bInfo] of backupMap.entries()) {
                if (bSlug.includes(slug) || slug.includes(bSlug)) {
                    backupCandidate = bInfo;
                    break;
                }
            }
        }
        
        if (backupCandidate && fs.existsSync(activeImagePath)) {
            const comparison = await compareImagesVisually(activeImagePath, backupCandidate.fullPath);
            if (comparison.success) {
                if (comparison.isIdentical) {
                    identicalCount++;
                } else {
                    differentCount++;
                }
                results.push({
                    name,
                    filename,
                    backupFile: backupCandidate.file,
                    backupSource: backupCandidate.source,
                    mae: comparison.mae.toFixed(2),
                    isIdentical: comparison.isIdentical,
                    status: 'success'
                });
            } else {
                errorCount++;
                results.push({
                    name,
                    filename,
                    backupFile: backupCandidate.file,
                    backupSource: backupCandidate.source,
                    status: 'error',
                    reason: comparison.reason
                });
            }
        }
    }

    console.log("\n📊 COMPARISON RESULTS:");
    console.log(`- Visually Identical (Already correct!): ${identicalCount}`);
    console.log(`- Different (Placeholder or outdated): ${differentCount}`);
    console.log(`- Errors / Missing matches: ${errorCount}`);

    // Print visually identical items
    console.log("\n✅ ITEMS ALREADY VISUALLY IDENTICAL TO BACKUPS (NO NEED TO REPROCESS):");
    results.filter(r => r.status === 'success' && r.isIdentical).forEach(r => {
        console.log(`  - [MAE: ${r.mae}] "${r.name}" (${r.filename}) matches "${r.backupFile}" in ${r.backupSource}`);
    });

    // Print different items
    console.log("\n⚠️ ITEMS THAT ARE DIFFERENT (NEED REPROCESSING OR ARE PLACEHOLDERS):");
    results.filter(r => r.status === 'success' && !r.isIdentical).forEach(r => {
        console.log(`  - [MAE: ${r.mae}] "${r.name}" (${r.filename}) is DIFFERENT from "${r.backupFile}" in ${r.backupSource}`);
    });
}

run().catch(console.error);
