const fs = require('fs');
const path = require('path');

const rootDir = path.join('c:', 'Users', 'apaci', 'Desktop', 'Script', 'witcher-compendium-main', '_tools', 'src-packs');

const replacements = [
    // The "à" prefix removal
    { pattern: /à(.)/g, replacement: '$1' },
    // Mojibake fixes (ANSI interpretation of UTF-8)
    { pattern: /â€™/g, replacement: "’" },
    { pattern: /â€œ/g, replacement: "“" },
    { pattern: /â€/g, replacement: "”" },
    { pattern: /â€”/g, replacement: "—" },
    { pattern: /â€“/g, replacement: "–" },
    { pattern: /â€¢/g, replacement: "•" },
    { pattern: /Ã /g, replacement: "à" },
    { pattern: /Ã¨/g, replacement: "è" },
    { pattern: /Ã©/g, replacement: "é" },
    { pattern: /Ã¬/g, replacement: "ì" },
    { pattern: /Ã²/g, replacement: "ò" },
    { pattern: /Ã¹/g, replacement: "ù" },
    { pattern: /Ã€/g, replacement: "À" },
    { pattern: /Ãˆ/g, replacement: "È" },
    { pattern: /Ã‰/g, replacement: "É" },
    { pattern: /ÃŒ/g, replacement: "Ì" },
    { pattern: /Ã’/g, replacement: "Ò" },
    { pattern: /Ã™/g, replacement: "Ù" },
    // Double spaces or weird artifacts
    { pattern: /à\s/g, replacement: " " }
];

function walk(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

let count = 0;

walk(rootDir, (filePath) => {
    if (filePath.endsWith('.json')) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let aCount = (content.match(/à/g) || []).length;
            
            // Only fix if there's a significant density of 'à' (corruption detector)
            if (aCount > 50) {
                let fixed = content;
                for (let r of replacements) {
                    fixed = fixed.replace(r.pattern, r.replacement);
                }
                
                if (fixed !== content) {
                    fs.writeFileSync(filePath, fixed, 'utf8');
                    count++;
                    console.log(`Fixed corruption: ${filePath} (${aCount} 'à' found)`);
                }
            }
        } catch (e) {
            console.error(`Error in ${filePath}: ${e.message}`);
        }
    }
});

console.log(`\nDone! Fixed ${count} corrupted files.`);
