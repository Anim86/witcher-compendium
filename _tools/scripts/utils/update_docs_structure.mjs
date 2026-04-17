import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution
const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_PACKS_DIR = path.join(REPO_ROOT, '_tools/src-packs');
const DOCS_DIR = path.join(REPO_ROOT, '_tools/DocumentoLavoro');

const START_MARKER = '<!-- FOLDER_STRUCTURE_START -->';
const END_MARKER = '<!-- FOLDER_STRUCTURE_END -->';

/**
 * Generates an ASCII tree of the directory structure
 * @param {string} dir Current directory
 * @param {string} prefix Tree prefix for recursion
 * @returns {string} The formatted tree
 */
function generateTree(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
        .filter(entry => entry.isDirectory()) // Only show folders
        .sort((a, b) => a.name.localeCompare(b.name));

    let tree = '';
    entries.forEach((entry, index) => {
        const isLast = index === entries.length - 1;
        const pointer = isLast ? '└── ' : '├── ';
        
        tree += `${prefix}${pointer}${entry.name}\n`;
        
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        tree += generateTree(path.join(dir, entry.name), newPrefix);
    });
    
    return tree;
}

/**
 * Updates documentation files with the current tree
 */
function updateDocs() {
    console.log('🔍 Scanning src-packs structure...');
    const treeBody = generateTree(SRC_PACKS_DIR);
    const fullTree = `_tools/src-packs/\n${treeBody}`;
    
    const timestamp = new Date().toLocaleDateString('it-IT', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    const replacementContent = `${START_MARKER}\n\`\`\`\n${fullTree}\`\`\`\n*Ultimo aggiornamento automatico: ${timestamp}*\n${END_MARKER}`;

    const docsToUpdate = fs.readdirSync(DOCS_DIR)
        .filter(f => f.endsWith('.md'));

    let updatedCount = 0;

    docsToUpdate.forEach(docName => {
        const docPath = path.join(DOCS_DIR, docName);
        let content = fs.readFileSync(docPath, 'utf8');

        if (content.includes(START_MARKER) && content.includes(END_MARKER)) {
            console.log(`📝 Updating ${docName}...`);
            const regex = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, 'g');
            content = content.replace(regex, replacementContent);
            fs.writeFileSync(docPath, content, 'utf8');
            updatedCount++;
        }
    });

    console.log(`\n✅ Done! Updated ${updatedCount} documentation files.`);
}

try {
    updateDocs();
} catch (error) {
    console.error('❌ Error updating documentation:', error);
    process.exit(1);
}
