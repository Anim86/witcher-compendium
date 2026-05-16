import fs from 'fs';
import path from 'path';

const reportPath = 'TO DO/REPORT_SCHEMI.md';
const jsonDir = '_tools/src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-schematics/';

function parseReport() {
    const content = fs.readFileSync(reportPath, 'utf8');
    const lines = content.split('\n');
    const data = new Map();

    // Skip header and separator
    for (let i = 4; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 5) continue;

        // | Nome | Descrizione | Nome Immagine | Path Immagine |
        // parts[0] is empty because line starts with |
        const name = parts[1];
        const description = parts[2];
        const imgPath = parts[4];

        data.set(imgPath, { name, description });
    }
    return data;
}

function updateJsonFiles(reportData) {
    const files = fs.readdirSync(jsonDir);
    let updatedCount = 0;

    for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(jsonDir, file);
        const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const imgPath = jsonContent.img;

        if (reportData.has(imgPath)) {
            const { name, description } = reportData.get(imgPath);
            
            // Basic cleanup of description (remove trailing dot if it's the only content)
            let cleanDesc = description;
            
            // Check for technical data
            // Example: Schema per la fabbricazione di: Acciaio. Componenti richiesti: Ferro (x1), Carbone (x5). Difficoltà Manifattura: CD 15. Tempo: 1 ora.
            const techRegex = /Componenti richiesti: (.*)\. Difficoltà Manifattura: CD (\d+)\. Tempo: (.*)\./;
            const match = description.match(techRegex);

            let updated = false;

            if (jsonContent.system.description !== `<p>${cleanDesc}</p>`) {
                jsonContent.system.description = `<p>${cleanDesc}</p>`;
                updated = true;
            }

            if (match) {
                const componentsStr = match[1];
                const difficulty = parseInt(match[2]);
                const time = match[3];

                if (jsonContent.system.difficulty !== difficulty) {
                    jsonContent.system.difficulty = difficulty;
                    updated = true;
                }
                if (jsonContent.system.time !== time) {
                    jsonContent.system.time = time;
                    updated = true;
                }

                // Update components array if possible
                // We keep the first part of the components string if it follows the pattern: Name Difficulty Time Components ...
                // But it's safer to just reconstruct it or update it if it's a simple list.
                // For now, let's just update the description, difficulty and time.
                // Most users care about those fields being correct.
            }

            if (updated) {
                fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 4), 'utf8');
                updatedCount++;
                console.log(`Updated: ${file} (${name})`);
            }
        }
    }
    console.log(`Total updated files: ${updatedCount}`);
}

const reportData = parseReport();
updateJsonFiles(reportData);
