const fs = require('fs');
const path = require('path');

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/REGOLAMENTO_E_NARRATIVA/witcher-lore';
const mdFile = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_lore_compendio.md';

function normalize(str) {
    if (!str) return '';
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]/g, '') // remove non-alphanumeric
        .trim();
}

// Custom manual resolutions for special/merged entries
const customMatches = {
    "veyopatisesvalblod": "veyopatis",
    "loreluoghidipotereunitaallenozionibasedelmanuale": "loreluoghidipotere"
};

// Load all JSON files in the pack
const jsonFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
const jsonDb = {};

for (const file of jsonFiles) {
    const filePath = path.join(srcDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const norm = normalize(content.name || '');
    jsonDb[norm] = {
        file,
        filePath,
        content
    };
}

console.log(`Loaded ${jsonFiles.length} JSON files from compendium pack.`);

// Read and parse report_lore_compendio.md
console.log(`Reading ${mdFile}...`);
const mdContent = fs.readFileSync(mdFile, 'utf8');
const lines = mdContent.split('\n');

const parsedItems = [];
for (const line of lines) {
    if (line.trim().startsWith('|') && line.includes('**')) {
        const parts = line.split('|');
        if (parts.length >= 5) {
            const name = parts[1].replace(/\*\*/g, '').trim();
            const img = parts[2].replace(/\`/g, '').trim();
            const sourcebook = parts[3].replace(/\*/g, '').trim();
            const desc = parts[4].trim();
            
            // Skip the table header row
            if (name.toLowerCase() === 'nome compendio') continue;
            
            parsedItems.push({ name, img, sourcebook, desc });
        }
    }
}

console.log(`Parsed ${parsedItems.length} items from Markdown report.`);

// Function to convert clean description to standard HTML paragraphs
function toStandardParagraphs(text) {
    if (!text) return '';
    // Unescape pipes
    let cleanText = text.replace(/\\\|/g, '|');
    // Split by <br> or \n and wrap in <p>
    const paragraphs = cleanText.split(/<br>|\n/).map(p => p.trim()).filter(Boolean);
    return paragraphs.map(p => `<p>${p}</p>`).join('');
}

// Update JSON files
let updatedCount = 0;

for (const item of parsedItems) {
    const normName = normalize(item.name);
    
    if (normName === "loreluoghidipotereunitaallenozionibasedelmanuale") {
        // Special case: split into places of power (manual) and lore places of power (TC)
        const fullDesc = item.desc.replace(/\\\|/g, '|');
        
        // Split where "Creare artificialmente" starts
        const splitStr = "Creare artificialmente";
        const splitIdx = fullDesc.indexOf(splitStr);
        if (splitIdx === -1) {
            console.error("ERROR: Could not find split point in merged Luoghi di Potere description!");
            continue;
        }
        
        const part1Raw = fullDesc.substring(0, splitIdx).trim();
        const part2Raw = fullDesc.substring(splitIdx).trim();
        
        // Luoghi di Potere (MB 122)
        const luoghiManual = jsonDb[normalize("luoghi di potere")];
        if (luoghiManual) {
            luoghiManual.content.system.description = `<p>${part1Raw}</p>`;
            fs.writeFileSync(luoghiManual.filePath, JSON.stringify(luoghiManual.content, null, 4), 'utf8');
            console.log(`Updated: luoghi_di_potere_415219194985e396.json (Luoghi di Potere)`);
            updatedCount++;
        } else {
            console.error("ERROR: luoghi_di_potere_415219194985e396.json not found!");
        }
        
        // Lore: Luoghi di Potere (TC 10)
        const luoghiLore = jsonDb[normalize("lore luoghi di potere")];
        if (luoghiLore) {
            // Note: In the original, it was "Creare un Luogo di Potere", but let's use the polished "Creare artificialmente un Luogo di Potere"
            luoghiLore.content.system.description = `<p>${part2Raw}</p>`;
            fs.writeFileSync(luoghiLore.filePath, JSON.stringify(luoghiLore.content, null, 4), 'utf8');
            console.log(`Updated: lore_luoghi_di_potere_5a33d643fae17112.json (Lore: Luoghi di Potere)`);
            updatedCount++;
        } else {
            console.error("ERROR: lore_luoghi_di_potere_5a33d643fae17112.json not found!");
        }
        
        continue;
    }
    
    // Find json file by normalized name or custom matches
    let jsonKey = normName;
    if (customMatches[normName]) {
        jsonKey = normalize(customMatches[normName]);
    }
    
    const dbItem = jsonDb[jsonKey];
    if (!dbItem) {
        console.warn(`WARNING: Could not find JSON file for item "${item.name}" (norm: ${normName})`);
        continue;
    }
    
    let htmlDesc = '';
    
    if (jsonKey === normalize("tipi di locali e taverne")) {
        // Structured HTML reconstruction
        const parts = item.desc.split('<br>').map(p => p.trim()).filter(Boolean);
        const intro = parts[0];
        const listItems = parts.slice(1).map(part => {
            // e.g. "I bordelli sono locali..." -> "<li><strong>I bordelli</strong> sono locali...</li>"
            // Let's identify the first few words to bold
            const match = part.match(/^(i bordelli|i club|le locande di posta|gli ostelli|le taverne)\s+(sono|si trovano)\s+(.*)$/i);
            if (match) {
                return `<li><strong>${match[1]}</strong> ${match[2]} ${match[3]}</li>`;
            }
            return `<li>${part}</li>`;
        });
        
        htmlDesc = `<p>${intro}</p><ul>${listItems.join('')}</ul>`;
        htmlDesc += `<p>Tirare 1d6 per determinare il tipo di locale.</p><table><tr><th>1d6</th><th>Tipo di Locale</th></tr><tr><td>1</td><td>Bordello</td></tr><tr><td>2</td><td>Club</td></tr><tr><td>3-4</td><td>Locanda di Posta</td></tr><tr><td>5</td><td>Ostello</td></tr><tr><td>6</td><td>Taverna</td></tr></table>`;
        
    } else if (jsonKey === normalize("peculiarita delle locande")) {
        // Structured HTML reconstruction
        const parts = item.desc.split('<br>').map(p => p.trim()).filter(Boolean);
        const intro = parts[0];
        
        let tableRows = '';
        for (const part of parts.slice(1)) {
            const match = part.match(/^(\d+):\s*(.*)$/);
            if (match) {
                tableRows += `<tr><td>${match[1]}</td><td>${match[2]}</td></tr>`;
            } else {
                tableRows += `<tr><td colspan="2">${part}</td></tr>`;
            }
        }
        
        htmlDesc = `<p>${intro} Tirare 2d6 per scoprire di che si tratta o inventarne una propria!</p><table><tr><th>2d6</th><th>Peculiarità</th></tr>${tableRows}</table>`;
        
    } else if (jsonKey === normalize("glossario dialetto skellige")) {
        // Structured HTML reconstruction
        const cleanDesc = item.desc.replace(/\\\|/g, '|');
        // Extract introductory text
        const introIdx = cleanDesc.indexOf('|');
        const intro = introIdx !== -1 ? cleanDesc.substring(0, introIdx).replace(/\|/g, '').trim() : cleanDesc;
        
        // Parse rows
        const tableRows = [];
        const pipeRows = cleanDesc.split('\n').map(r => r.trim()).filter(r => r.startsWith('|'));
        
        for (const r of pipeRows) {
            const cells = r.split('|').map(c => c.trim()).filter(Boolean);
            if (cells.length >= 2) {
                const skellige = cells[0];
                const traduzione = cells[1];
                if (skellige.toLowerCase() === 'skellige' || skellige.startsWith(':---')) continue;
                tableRows.push(`<tr><td>${skellige}</td><td>${traduzione}</td></tr>`);
            }
        }
        
        htmlDesc = `<p>${intro}</p><table><tr><th>Skellige</th><th>Traduzione</th></tr>${tableRows.join('')}</table>`;
        
    } else {
        // Standard paragraphs
        htmlDesc = toStandardParagraphs(item.desc);
    }
    
    // Update system.description and sourcebook
    dbItem.content.system.description = htmlDesc;
    if (item.sourcebook) {
        dbItem.content.system.sourcebook = item.sourcebook;
    }
    
    // Save file
    fs.writeFileSync(dbItem.filePath, JSON.stringify(dbItem.content, null, 4), 'utf8');
    console.log(`Updated: ${dbItem.file} (${item.name})`);
    updatedCount++;
}

console.log(`\nSuccessfully updated ${updatedCount} JSON files.`);
