
const fs = require('fs');
const path = require('path');

const root = 'witcher-compendium/assets/EQUIPAGGIAMENTO_E_TRASPORTI';
const orphanDir = path.join(root, '_review_orphans');
const jsonOrphanDir = '_tools/src-packs/EQUIPAGGIAMENTO_E_TRASPORTI/_review_orphans';

const recoveryMap = [
    // Armature
    { src: 'armatura_del_manticora.webp', dst: 'Armi_e_Armature/witcher-armor/armatura_della_manticora.webp' },
    { src: 'armatura_del_orso.webp', dst: 'Armi_e_Armature/witcher-armor/armatura_dell_orso.webp' },
    { src: 'armatura_del_vipera.webp', dst: 'Armi_e_Armature/witcher-armor/armatura_della_vipera.webp' },
    
    // Armi
    { src: 'balestra_del_orso.webp', dst: 'Armi_e_Armature/witcher-weapons/balestra_dell_orso.webp' },
    { src: 'scudo_del_manticora.webp', dst: 'Armi_e_Armature/witcher-weapons/scudo_della_manticora.webp' },
    { src: 'spada_d_acciaio_del_manticora.webp', dst: 'Armi_e_Armature/witcher-weapons/spada_d_acciaio_della_manticora.webp' },
    { src: 'spada_d_acciaio_del_orso.webp', dst: 'Armi_e_Armature/witcher-weapons/spada_d_acciaio_dell_orso.webp' },
    { src: 'spada_d_acciaio_del_vipera.webp', dst: 'Armi_e_Armature/witcher-weapons/spada_d_acciaio_della_vipera.webp' },
    { src: 'spada_d_argento_del_manticora.webp', dst: 'Armi_e_Armature/witcher-weapons/spada_d_argento_della_manticora.webp' },
    { src: 'spada_d_argento_del_orso.webp', dst: 'Armi_e_Armature/witcher-weapons/spada_d_argento_dell_orso.webp' },
    { src: 'spada_d_argento_del_vipera.webp', dst: 'Armi_e_Armature/witcher-weapons/spada_d_argento_della_vipera.webp' },
    { src: 'zanna_del_vipera.webp', dst: 'Armi_e_Armature/witcher-weapons/zanna_della_vipera.webp' },
    
    // Trasporti
    { src: 'carro_base.webp', dst: 'Trasporti/witcher-transports/carro_base.webp' },
    { src: 'carro_da_guerra.webp', dst: 'Trasporti/witcher-transports/carro_da_guerra.webp' },
    { src: 'carro_di_qualita.webp', dst: 'Trasporti/witcher-transports/carro_di_qualita.webp' },
    { src: 'carro_d_appoggio.webp', dst: 'Trasporti/witcher-transports/carro_d_appoggio.webp' },
    { src: 'assali_rinforzati.webp', dst: 'Trasporti/witcher-transports/assali_rinforzati.webp' },
    { src: 'cinghie_da_carico.webp', dst: 'Trasporti/witcher-transports/cinghie_da_carico.webp' },
    { src: 'sedia_a_rotelle_base.webp', dst: 'Trasporti/witcher-transports/sedia_a_rotelle_base.webp' },
    { src: 'sedia_a_rotelle_di_qualita.webp', dst: 'Trasporti/witcher-transports/sedia_a_rotelle_di_qualita.webp' },
    
    // Schemi (Riconoscibili dal prefisso o contesto)
    { src: 'schema_sedia_a_rotelle_base.webp', dst: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics/schema_sedia_a_rotelle_base.webp' },
    { src: 'schema_sedia_a_rotelle_di_qualita.webp', dst: 'ALCHIMIA_E_ARTIGIANATO/Schemi_di_Fabbricazione/witcher-schematics/schema_sedia_a_rotelle_di_qualita.webp' },

    // Attrezzatura
    { src: 'amplificatore.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/amplificatore.webp' },
    { src: 'anello_del_favore.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/anello_del_favore.webp' },
    { src: 'bambola_da_magia_nera.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/bambola_da_magia_nera.webp' },
    { src: 'baule_nascosto.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/baule_nascosto.webp' },
    { src: 'borsa_di_biglie.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/borsa_di_biglie.webp' },
    { src: 'bottiglia.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/bottiglia.webp' },
    { src: 'broderick_il_bisteccone.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/broderick_il_bisteccone.webp' },
    { src: 'bussola.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/bussola.webp' },
    { src: 'camera_di_distillazione.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/camera_di_distillazione.webp' },
    { src: 'capacita_muco.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/capacita_muco.webp' },
    { src: 'compartimento_segreto.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/compartimento_segreto.webp' },
    { src: 'coppia_di_puntelli.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/coppia_di_puntelli.webp' },
    { src: 'corno_da_segnalazione.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/corno_da_segnalazione.webp' },
    { src: 'cote_nanica.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/cote_nanica.webp' },
    { src: 'fischietto_da_segnalazione.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/fischietto_da_segnalazione.webp' },
    { src: 'serratura_con_trappola.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/serratura_con_trappola.webp' },
    { src: 'strumento_musicale_elfico.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/strumento_musicale_elfico.webp' },
    { src: 'taglia_monete.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/taglia_monete.webp' },
    { src: 'tavolo_strategico_portatile.webp', dst: 'Attrezzatura_e_Oggetti/witcher-equipment/tavolo_strategico_portatile.webp' }
];

console.log('--- RECOVERING ASSETS ---');
recoveryMap.forEach(item => {
    const srcPath = path.join(orphanDir, item.src);
    // Note: dst can be in a different root subfolder (like ALCHIMIA)
    const dstPath = path.join('witcher-compendium/assets', item.dst);
    
    if (fs.existsSync(srcPath)) {
        const dstDir = path.dirname(dstPath);
        if (!fs.existsSync(dstDir)) {
            fs.mkdirSync(dstDir, { recursive: true });
        }
        fs.renameSync(srcPath, dstPath);
        console.log(`Recovered: ${item.src} -> ${item.dst}`);
    } else {
        console.warn(`Source not found: ${item.src}`);
    }
});

console.log('\n--- CLEANING JSON ORPHANS ---');
if (fs.existsSync(jsonOrphanDir)) {
    const jsonFiles = fs.readdirSync(jsonOrphanDir);
    jsonFiles.forEach(file => {
        fs.unlinkSync(path.join(jsonOrphanDir, file));
        console.log(`Deleted orphan JSON: ${file}`);
    });
    fs.rmdirSync(jsonOrphanDir);
}

console.log('\n--- CLEANING ASSET ORPHAN DIR ---');
if (fs.existsSync(orphanDir)) {
    const remainingFiles = fs.readdirSync(orphanDir);
    if (remainingFiles.length === 0) {
        fs.rmdirSync(orphanDir);
        console.log('Orphan directory removed.');
    } else {
        console.log(`Remaining files in orphan dir: ${remainingFiles.join(', ')}`);
    }
}
