
const fs = require('fs');
const path = require('path');

const root = '.';
const garbageBase = '_tools/_garbage';

const moveList = [
    // Reports to garbage/reports
    { srcDir: '_tools/reports', dstDir: path.join(garbageBase, 'reports'), 
      exclude: ['smart-missing-assets.md', 'session_handover.md'] },
    
    // Legacy Python scripts to garbage/scripts
    { srcDir: '_tools/scripts/utils', dstDir: path.join(garbageBase, 'scripts'), 
      includeExt: ['.py'] },
    
    // Scratch files to garbage/scratch
    { srcDir: 'scratch', dstDir: path.join(garbageBase, 'scratch') },
];

moveList.forEach(rule => {
    if (!fs.existsSync(rule.srcDir)) return;
    
    const files = fs.readdirSync(rule.srcDir);
    files.forEach(file => {
        const srcPath = path.join(rule.srcDir, file);
        if (fs.lstatSync(srcPath).isDirectory()) return;

        // Apply filters
        if (rule.exclude && rule.exclude.includes(file)) return;
        if (rule.includeExt && !rule.includeExt.includes(path.extname(file))) return;

        const dstPath = path.join(rule.dstDir, file);
        
        try {
            fs.renameSync(srcPath, dstPath);
            console.log(`Moved: ${srcPath} -> ${dstPath}`);
        } catch (e) {
            console.error(`Failed to move ${srcPath}: ${e.message}`);
        }
    });
});

// Clean root of temporary files
const rootFiles = fs.readdirSync(root);
rootFiles.forEach(file => {
    if (file.endsWith('.log') || file.endsWith('.tmp') || file === 'temp_cleanup_list.txt') {
        const srcPath = path.join(root, file);
        const dstPath = path.join(garbageBase, file);
        fs.renameSync(srcPath, dstPath);
        console.log(`Moved root file: ${file}`);
    }
});
