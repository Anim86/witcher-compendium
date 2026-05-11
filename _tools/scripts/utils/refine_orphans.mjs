import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_ROOT = path.join(REPO_ROOT, '_tools', 'src-packs');
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium', 'assets');
const ORPHAN_ASSETS_DIR = path.join(ASSETS_ROOT, 'EQUIPAGGIAMENTO_E_TRASPORTI', '_review_orphans');
const ORPHAN_JSON_DIR = path.join(SRC_ROOT, 'EQUIPAGGIAMENTO_E_TRASPORTI', '_review_orphans');

const PACK_KEYWORDS = {
    'spada': 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons',
    'balestra': 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons',
    'zanna': 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons',
    'scudo': 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons',
    'armatura': 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-armor',
    'protesi': 'EQUIPAGGIAMENTO_E_TRASPORTI/Protesi/witcher-dlc-dp-equipment',
    'sedia': 'EQUIPAGGIAMENTO_E_TRASPORTI/Trasporti/witcher-transports',
    'carro': 'EQUIPAGGIAMENTO_E_TRASPORTI/Trasporti/witcher-transports',
    'assali': 'EQUIPAGGIAMENTO_E_TRASPORTI/Trasporti/witcher-transports',
    'ruote': 'EQUIPAGGIAMENTO_E_TRASPORTI/Trasporti/witcher-transports',
    'schema': 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics',
    'formula': 'ALCHIMIA_E_ARTIGIANATO/Formule_e_Ricette/witcher-alchemy'
};

const DEFAULT_EQUIP_PACK = 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment';

async function findItemInMainPacks(name) {
    const results = [];
    const cleanSearch = name.toLowerCase().replace(/['\s_]/g, '');
    
    const walk = (dir) => {
        if (dir.includes('_review_orphans')) return;
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (file.endsWith('.json')) {
                try {
                    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    if (content.name) {
                        const cleanItemName = content.name.toLowerCase().replace(/['\s_]/g, '');
                        // Match più stretto per evitare falsi positivi
                        if (cleanItemName === cleanSearch || 
                           (cleanItemName.includes(cleanSearch) && content.type !== 'monster' && content.type !== 'component')) {
                            results.push({ path: fullPath, data: content });
                        }
                    }
                } catch (e) {}
            }
        }
    };
    walk(SRC_ROOT);
    return results;
}

function getTargetPack(name) {
    const lower = name.toLowerCase();
    for (const [kw, pack] of Object.entries(PACK_KEYWORDS)) {
        if (lower.includes(kw)) return pack;
    }
    return DEFAULT_EQUIP_PACK;
}

async function main() {
    console.log("🚀 Rifinitura Migrazione Asset e JSON...");
    const report = { images: 0, jsons: 0 };

    // 1. Spostamento JSON orfani e relative immagini
    if (fs.existsSync(ORPHAN_JSON_DIR)) {
        const orphanJsons = fs.readdirSync(ORPHAN_JSON_DIR).filter(f => f.endsWith('.json'));
        for (const jsonName of orphanJsons) {
            const orphanPath = path.join(ORPHAN_JSON_DIR, jsonName);
            const content = JSON.parse(fs.readFileSync(orphanPath, 'utf8'));
            
            const exists = await findItemInMainPacks(content.name);
            if (exists.length === 0) {
                const targetPack = getTargetPack(content.name);
                const destJsonDir = path.join(SRC_ROOT, targetPack);
                const destJsonPath = path.join(destJsonDir, jsonName);

                console.log(`Processing: ${content.name}`);

                // Gestione immagine
                const imgBasename = path.basename(content.img);
                const srcImgPath = path.join(ORPHAN_ASSETS_DIR, imgBasename);
                const destAssetDir = path.join(ASSETS_ROOT, targetPack);
                const destImgPath = path.join(destAssetDir, imgBasename);

                if (fs.existsSync(srcImgPath)) {
                    if (!fs.existsSync(destAssetDir)) fs.mkdirSync(destAssetDir, { recursive: true });
                    fs.copyFileSync(srcImgPath, destImgPath);
                    content.img = `modules/witcher-compendium/assets/${targetPack.replace(/\\/g, '/')}/${imgBasename}`;
                    console.log(`  🖼️ Immagine copiata in ${targetPack}`);
                    report.images++;
                }

                if (!fs.existsSync(destJsonDir)) fs.mkdirSync(destJsonDir, { recursive: true });
                fs.writeFileSync(destJsonPath, JSON.stringify(content, null, 4), 'utf8');
                console.log(`  📄 JSON spostato in ${targetPack}`);
                report.jsons++;
                
                // Opzionale: pulizia se sicuro
                // fs.unlinkSync(orphanPath);
            }
        }
    }

    // 2. Correzione mirata armi (Scuole)
    console.log("\n⚔️ Correzione mirata armi Scuole Witcher...");
    const schoolWeapons = [
        { name: "Spada d'Acciaio dell'Orso", img: "spada_dacciaio_del_orso.webp" },
        { name: "Spada d'Argento dell'Orso", img: "spada_dargento_del_orso.webp" },
        { name: "Spada d'Acciaio della Manticora", img: "spada_dacciaio_del_manticora.webp" },
        { name: "Spada d'Argento della Manticora", img: "spada_dargento_del_manticora.webp" },
        { name: "Spada d'Acciaio della Vipera", img: "spada_dacciaio_del_vipera.webp" },
        { name: "Spada d'Argento della Vipera", img: "spada_dargento_del_vipera.webp" },
        { name: "Zanna della Vipera", img: "zanna_del_vipera.webp" }
    ];

    for (const weapon of schoolWeapons) {
        const matches = await findItemInMainPacks(weapon.name);
        for (const match of matches) {
            if (match.path.includes('witcher-weapons')) {
                const packDir = "EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons";
                const srcImgPath = path.join(ORPHAN_ASSETS_DIR, weapon.img);
                const destImgPath = path.join(ASSETS_ROOT, packDir, weapon.img);

                if (fs.existsSync(srcImgPath)) {
                    fs.copyFileSync(srcImgPath, destImgPath);
                    match.data.img = `modules/witcher-compendium/assets/${packDir}/${weapon.img}`;
                    fs.writeFileSync(match.path, JSON.stringify(match.data, null, 4), 'utf8');
                    console.log(`  ✅ Aggiornata ${weapon.name} -> ${weapon.img}`);
                }
            }
        }
    }

    console.log(`\n✅ Rifinitura completata. Immagini gestite: ${report.images}, JSON gestiti: ${report.jsons}.`);
}

main().catch(console.error);
