import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_ROOT = path.join(REPO_ROOT, '_tools', 'src-packs');
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const MODULE_JSON_PATH = path.join(REPO_ROOT, 'witcher-compendium', 'module.json');
const TEMP_ROOT = path.join(REPO_ROOT, '_tools', '_REORG_TEMP');

const CATEGORIES = {
    BESTIARIO: {
        'Mostri': ['witcher-monsters', 'witcher-dlc-ms-monsters'],
        'Personaggi': ['witcher-png', 'witcher-png-racconti', 'witcher-dlc-ts-png', 'witcher-dlc-dp-png']
    },
    MAGIA_E_MALEDIZIONI: {
        'Segni': ['witcher-signs', 'witcher-signs-chaos'],
        'Incantesimi_e_Rituali': [
            'witcher-spells', 'witcher-spells-racconti', 'witcher-rituals', 
            'witcher-spells-chaos', 'witcher-rituals-chaos', 'witcher-runes'
        ],
        'Doni_del_Caos': ['witcher-gifts', 'witcher-invocations', 'witcher-goetia'],
        'Necromanzia': ['witcher-necromanzia'],
        'Maledizioni_e_Fatture': ['witcher-curses', 'witcher-hexes', 'witcher-hexes-base']
    },
    EQUIPAGGIAMENTO_E_TRASPORTI: {
        'Armi_e_Armature': [
            'witcher-weapons', 'witcher-armor', 'witcher-weapons-racconti', 
            'witcher-dlc-sw-equipment', 'witcher-dlc-sr-equipment', 
            'witcher-dlc-ts-equipment', 'witcher-dlc-ap-equipment', 
            'witcher-dlc-sl-equipment'
        ],
        'Trasporti': ['witcher-transports'],
        'Attrezzatura_e_Oggetti': ['witcher-equipment', 'witcher-special', 'witcher-special-chaos'],
        'Reliquie_e_Artefatti': ['witcher-magic-items'],
        'Protesi': ['witcher-dlc-dp-equipment']
    },
    ALCHIMIA_E_ARTIGIANATO: {
        'Componenti': [
            'witcher-components', 'witcher-components-diario', 'witcher-components-racconti', 
            'witcher-dlc-ms-components', 'witcher-components-mutageni-dw'
        ],
        'Mutageni': ['witcher-mutations', 'witcher-mutazioni-tc'],
        'Formule_e_Ricette': ['witcher-alchemy', 'witcher-dlc-ts-alchemy', 'witcher-dlc-ap-alchemy'],
        'Schemi_di_Fabbricazione': [
            'witcher-schematics', 'witcher-schematics-racconti', 
            'witcher-dlc-sw-schematics', 'witcher-dlc-ts-schematics', 'witcher-dlc-sl-schematics'
        ]
    },
    REGOLAMENTO_E_NARRATIVA: {
        'Professioni_e_Abilita': ['witcher-professions', 'witcher-skills', 'witcher-races', 'witcher-dlc-np-professions'],
        'Investigazioni': ['witcher-investigations'],
        'Ferite_Critiche': ['witcher-critical-wounds'],
        'Lore_e_Racconti': ['witcher-lore', 'witcher-lore-racconti', 'witcher-lore-chaos', 'witcher-dlc-sr-lore'],
        'Trofei': ['witcher-trophies'],
        'Geografia': ['witcher-geografia']
    }
};

function getPackMapping(packName) {
    for (const [catName, subCats] of Object.entries(CATEGORIES)) {
        for (const [subName, packs] of Object.entries(subCats)) {
            if (packs.includes(packName)) {
                return { cat: catName, sub: subName };
            }
        }
    }
    return { cat: '_DA_RICOLLOCARE', sub: '' };
}

async function run() {
    console.log("🚀 Starting RESILIENT global reorganization...");

    if (!fs.existsSync(TEMP_ROOT)) fs.mkdirSync(TEMP_ROOT);

    const moduleJson = JSON.parse(fs.readFileSync(MODULE_JSON_PATH, 'utf8'));
    const packs = moduleJson.packs;

    // Phase 1: Move everything to TEMP
    console.log("📁 Phase 1: Moving all packs to temporary storage...");
    for (const pack of packs) {
        const packName = pack.name;
        // Check if it's already where it should be (from a previous partial run)
        const mapping = getPackMapping(packName);
        const targetRelPath = mapping.sub ? path.join(mapping.cat, mapping.sub, packName) : path.join(mapping.cat, packName);
        
        let foundPath = null;
        const possiblePaths = [
            path.join(SRC_ROOT, pack.path.replace(/^packs\//, '')), // As defined in module.json
            path.join(SRC_ROOT, targetRelPath) // As it might have been moved
        ];

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                foundPath = p;
                break;
            }
        }

        if (foundPath) {
            const tempPackPath = path.join(TEMP_ROOT, 'src', packName);
            fs.mkdirSync(path.dirname(tempPackPath), { recursive: true });
            if (fs.existsSync(tempPackPath)) fs.rmSync(tempPackPath, { recursive: true, force: true });
            fs.renameSync(foundPath, tempPackPath);
            console.log(`   📦 Moved ${packName} to temp (src)`);
        }

        // Assets
        let foundAssetPath = null;
        const possibleAssetPaths = [
            path.join(ASSETS_ROOT, pack.path.replace(/^packs\//, '')),
            path.join(ASSETS_ROOT, targetRelPath)
        ];

        for (const p of possibleAssetPaths) {
            if (fs.existsSync(p)) {
                foundAssetPath = p;
                break;
            }
        }

        if (foundAssetPath) {
            const tempAssetPath = path.join(TEMP_ROOT, 'assets', packName);
            fs.mkdirSync(path.dirname(tempAssetPath), { recursive: true });
            if (fs.existsSync(tempAssetPath)) fs.rmSync(tempAssetPath, { recursive: true, force: true });
            fs.renameSync(foundAssetPath, tempAssetPath);
            console.log(`   🖼️ Moved ${packName} to temp (assets)`);
        }
    }

    // Clean up old folders in SRC_ROOT and ASSETS_ROOT that might be empty or problematic
    // We'll do this by basically clearing out the old structures if they are now empty
    const oldRoots = ['CORE', 'BESTIARIO', 'EQUIPAGGIAMENTO', 'MAGIA', 'CRAFTING', 'GAMEPLAY', 'LORE', 'DLC', 'GEOGRAFIA'];
    for (const root of oldRoots) {
        const p1 = path.join(SRC_ROOT, root);
        const p2 = path.join(ASSETS_ROOT, root);
        if (fs.existsSync(p1)) fs.rmSync(p1, { recursive: true, force: true });
        if (fs.existsSync(p2)) fs.rmSync(p2, { recursive: true, force: true });
    }

    // Phase 2: Move from TEMP to final destination
    console.log("\n📁 Phase 2: Moving from temp to final destination...");
    for (const pack of packs) {
        const packName = pack.name;
        const mapping = getPackMapping(packName);
        const targetRelPath = mapping.sub ? path.join(mapping.cat, mapping.sub, packName) : path.join(mapping.cat, packName);
        
        const tempSrc = path.join(TEMP_ROOT, 'src', packName);
        if (fs.existsSync(tempSrc)) {
            const finalSrc = path.join(SRC_ROOT, targetRelPath);
            fs.mkdirSync(path.dirname(finalSrc), { recursive: true });
            fs.renameSync(tempSrc, finalSrc);
            console.log(`   ✅ Restored ${packName} (src) to ${targetRelPath}`);
        }

        const tempAsset = path.join(TEMP_ROOT, 'assets', packName);
        if (fs.existsSync(tempAsset)) {
            const finalAsset = path.join(ASSETS_ROOT, targetRelPath);
            fs.mkdirSync(path.dirname(finalAsset), { recursive: true });
            fs.renameSync(tempAsset, finalAsset);
            console.log(`   ✅ Restored ${packName} (assets) to ${targetRelPath}`);
        }

        // Update module.json
        pack.path = `packs/${targetRelPath}`.replace(/\\/g, '/');
    }

    // Save module.json
    fs.writeFileSync(MODULE_JSON_PATH, JSON.stringify(moduleJson, null, 2), 'utf8');
    console.log("\n✅ module.json updated.");

    // Cleanup TEMP
    fs.rmSync(TEMP_ROOT, { recursive: true, force: true });
    
    console.log("✨ Reorganization complete.");
}

run().catch(err => {
    console.error("💥 Error during reorganization:");
    console.error(err);
});
