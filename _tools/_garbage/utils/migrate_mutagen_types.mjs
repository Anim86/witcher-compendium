import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mutationsDir = path.resolve(__dirname, '../../src-packs/ALCHIMIA_E_ARTIGIANATO/witcher-mutations');

// Special lookup tables for the 5 mutagens without explicit CD/Mutazione in their description
const specialMutagens = {
    "mutageno_alp_blu_c12e979a60afeb14.json": {
        effect: "Aumenta la Volontà (+1)",
        alchemyDC: 18,
        minorMutation: ""
    },
    "mutageno_d_orso_verde_5c551170e0f9898d.json": {
        effect: "Aumenta permanentemente la vitalità (+10 PS)",
        alchemyDC: 20,
        minorMutation: "Massiccia crescita di pelo"
    },
    "mutageno_gatto_mannaro_rosso_1927c23f510e9d36.json": {
        effect: "Aumenta i danni in mischia (+3)",
        alchemyDC: 20,
        minorMutation: ""
    },
    "mutageno_glustyworp_verde_24f92a4b90eb9f15.json": {
        effect: "Aumenta la robustezza fisica (+10 PS)",
        alchemyDC: 20,
        minorMutation: ""
    },
    "mutageno_penitente_blu_255a1d339d1cb6b1.json": {
        effect: "Espande la capacità di sopportare lo stress magico (+2 Vigore)",
        alchemyDC: 18,
        minorMutation: "Macchie bianche e luminescenti"
    }
};

function getSource(name) {
    let s = name;
    s = s.replace(/^mutageno:\s*/i, '');
    s = s.replace(/^mutageno\s+della\s+/i, '');
    s = s.replace(/^mutageno\s+dell'\s*/i, '');
    s = s.replace(/^mutageno\s+del\s+/i, '');
    s = s.replace(/^mutageno\s+d'\s*/i, '');
    s = s.replace(/^mutageno\s+/i, '');
    s = s.replace(/\s*\([^)]+\)\s*$/, '');
    s = s.trim();
    return s;
}

function getColor(name) {
    const nameU = name.toUpperCase();
    if (nameU.includes('(BLU)') || nameU.includes('(BLUE)')) return 'Blue';
    if (nameU.includes('(ROSSO)') || nameU.includes('(RED)')) return 'Red';
    if (nameU.includes('(VERDE)') || nameU.includes('(GREEN)')) return 'Green';
    
    // Guess by filename or content if not found
    if (nameU.includes('BLU')) return 'Blue';
    if (nameU.includes('ROSSO')) return 'Red';
    if (nameU.includes('VERDE')) return 'Green';
    
    return 'Green'; // Fallback
}

async function run() {
    console.log(`Starting mutagen schema migration in: ${mutationsDir}`);
    const files = fs.readdirSync(mutationsDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} JSON files.`);

    let updatedCount = 0;

    for (const file of files) {
        const filePath = path.join(mutationsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        const data = JSON.parse(content);

        // We migrate files that are not of type 'mutagen'
        if (data.type === 'mutagen') {
            console.log(`- Skipping already migrated file: ${file} (${data.name})`);
            continue;
        }

        console.log(`⚡ Migrating file: ${file} (${data.name})`);

        const oldSystem = data.system || {};
        const name = data.name || '';
        const description = oldSystem.description || '';
        const cleanText = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        let effect = '';
        let alchemyDC = 0;
        let minorMutation = '';

        if (specialMutagens[file]) {
            // Apply special overrides for files without standard structured description
            const spec = specialMutagens[file];
            effect = spec.effect;
            alchemyDC = spec.alchemyDC;
            minorMutation = spec.minorMutation;
        } else {
            // Parse structured description: "Effetto: ... CD Mutazione: ... Mutazione Minore: ..."
            const effectMatch = cleanText.match(/Effetto:\s*([^.]+)/i);
            if (effectMatch) {
                effect = effectMatch[1].trim();
            } else {
                const aumentaMatch = cleanText.match(/(Aumenta[^.]+)/i);
                if (aumentaMatch) {
                    effect = aumentaMatch[1].trim();
                } else {
                    const firstSentence = cleanText.split('.')[0];
                    effect = firstSentence;
                }
            }

            const dcMatch = cleanText.match(/(?:CD Mutazione|CD Alchimia|CD Alchimia per processarlo|CD):\s*(\d+)/i);
            if (dcMatch) {
                alchemyDC = parseInt(dcMatch[1], 10);
            }

            const minorMatch = cleanText.match(/Mutazione Minore[^:]*:\s*(.+)/i);
            if (minorMatch) {
                minorMutation = minorMatch[1].trim();
                // Clean up any trailing text like ". CD Mutazione: ..." if it matched too much
                minorMutation = minorMutation.split('. CD')[0].split('. CD')[0].trim();
            }
        }

        // Build new system structure matching correct mutagen schema
        const newSystem = {
            description: description,
            quantity: oldSystem.quantity || '1',
            weight: oldSystem.weight !== undefined ? oldSystem.weight : 0.5,
            cost: oldSystem.cost !== undefined ? oldSystem.cost : 0,
            sourcebook: oldSystem.sourcebook || '',
            isHidden: oldSystem.isHidden !== undefined ? oldSystem.isHidden : false,
            isStored: oldSystem.isStored !== undefined ? oldSystem.isStored : false,
            isCarried: oldSystem.isCarried !== undefined ? oldSystem.isCarried : true,
            type: getColor(name),
            source: getSource(name),
            effect: effect,
            alchemyDC: alchemyDC,
            minorMutation: minorMutation,
            isConsumable: false,
            consumeProperties: {
                doesHeal: false,
                heal: "",
                addsTempHp: false,
                temporaryHp: {
                    value: "",
                    duration: 0
                },
                effects: [],
                removesEffects: []
            }
        };

        // Update the main document type
        data.type = 'mutagen';
        data.system = newSystem;

        // Ensure proper V14 stats block
        if (!data._stats) {
            data._stats = {};
        }
        data._stats.systemId = "TheWitcherItaNewSystem";
        data._stats.coreVersion = 14;
        delete data._stats.systemVersion;

        // Write file back to disk
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        updatedCount++;
    }

    console.log(`🎉 Finished migration! Successfully migrated ${updatedCount} mutagen files.`);
}

run().catch(console.error);
