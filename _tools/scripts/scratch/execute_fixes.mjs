import fs from 'fs';
import path from 'path';

const REPO_ROOT = 'E:/AntigravitiProgetti/CompendioTheWitcher';
const ASSETS_ROOT = path.join(REPO_ROOT, 'witcher-compendium/assets');

const fixes = [
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Pietra_Arco__Pietra_del_Potere_.webp', source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos/pietra_arco_pietra_del_potere.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Pugnale_di_Diaspro_Sang..webp', source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/pugnale_di_diaspro_sang.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_della_Vipera_(Acciaio).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_della_vipera.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_della_Vipera_(Argento).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_della_vipera.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_della_Vipera_(Zanna).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_della_vipera.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_della_Manticora_(Acciaio).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_della_manticora.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_della_Manticora_(Argento).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_della_manticora.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_del_Gatto_(Acciaio).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_del_gatto.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_del_Gatto_(Argento).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_del_gatto.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_del_Gatto_(Balestra).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_del_gatto.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_del_Grifone_(Acciaio).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_del_grifone.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_del_Grifone_(Argento).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_del_grifone.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_del_Grifone_(Balestra).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_del_grifone.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_del_Lupo_(Acciaio).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_del_lupo.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Armi_e_Armature/witcher-weapons/Scuola_del_Lupo_(Argento).webp', source: 'REGOLAMENTO_E_NARRATIVA/Lore_e_Racconti/witcher-lore/scuola_del_lupo.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/Amuleto_Incantato__1_Incantesimo_.webp', source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos/amuleto_incantato_1_incantesimo.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/Amuleto_Incantato__2_Incantesimi_.webp', source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos/amuleto_incantato_2_incantesimi.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/Amuleto_Incantato__3_Incantesimi_.webp', source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos/amuleto_incantato_3_incantesimi.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/Amuleto_Incantato__4_Incantesimi_.webp', source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos/amuleto_incantato_4_incantesimi.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/Formula_Magica__Esperto_.webp', source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos/formula_magica_esperto.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/Formula_Magica__Maestro_.webp', source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos/formula_magica_maestro.webp' },
    { target: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-equipment/Formula_Magica__Novizio_.webp', source: 'EQUIPAGGIAMENTO_E_TRASPORTI/Attrezzatura_e_Oggetti/witcher-special-chaos/formula_magica_novizio.webp' }
];

console.log(`Esecuzione di ${fixes.length} riparazioni sicure...`);

fixes.forEach(f => {
    const src = path.join(ASSETS_ROOT, f.source);
    const dest = path.join(ASSETS_ROOT, f.target);
    
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Riparato: ${f.target}`);
    } else {
        console.error(`❌ Sorgente non trovata: ${src}`);
    }
});

console.log("Riparazioni completate.");
