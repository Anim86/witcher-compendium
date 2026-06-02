import fs from 'fs';
import path from 'path';

const srcDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/REGOLAMENTO_E_NARRATIVA/witcher-critical-wounds';
const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_ferite_critiche_asset.md';

const promptTemplates = {
    "Braccio Fratturato": "Digital painting viewed from directly above, top-down perspective, an ancient gritty anatomical parchment showing a detailed medical sketch of a human arm bone (humerus/radius) with a prominent fracture highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to old bone saws, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Costole Incrinate": "Digital painting viewed from directly above, top-down perspective, an ancient gritty anatomical parchment showing a detailed medical sketch of a human ribcage with a hairline fracture on the ribs highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to blood-stained bandages, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Costole Rotte": "Digital painting viewed from directly above, top-down perspective, an ancient gritty anatomical parchment showing a detailed medical sketch of a human ribcage with severely shattered and displaced ribs highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to rusty medical shears, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Danni Cardiaci": "Digital painting viewed from directly above, top-down perspective, an ancient gritty anatomical parchment showing a detailed medical sketch of a human heart with severe muscle tearing and arterial damage highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to an apothecary vial of clotting agent, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Decapitazione": "Digital painting viewed from directly above, top-down perspective, a grim ancient parchment displaying a chilling historical drawing of a severed neck and head, showing clean cervical vertebrae cuts highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to a dried blood-spattered iron executioner axe, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Gamba Fratturata": "Digital painting viewed from directly above, top-down perspective, an ancient gritty anatomical parchment showing a detailed medical sketch of a human leg bone (femur/tibia) with a severe compound fracture highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to a crude wooden splint, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Mascella Incrinata": "Digital painting viewed from directly above, top-down perspective, an ancient gritty anatomical parchment showing a detailed medical sketch of a human skull with a cracked mandible highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to a jar of soothing herbal poultice, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Milza Lesionata": "Digital painting viewed from directly above, top-down perspective, an ancient gritty anatomical parchment showing a detailed medical sketch of the human abdomen showing a ruptured, hemorrhaging spleen highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to a blood-soaked surgeon cloth, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Occhio Danneggiato": "Digital painting viewed from directly above, top-down perspective, an ancient gritty anatomical parchment showing a detailed medical sketch of the human eye showing severe iris laceration and optic nerve damage highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to a leather eye patch and surgical forceps, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Pneumotorace": "Digital painting viewed from directly above, top-down perspective, an ancient gritty anatomical parchment showing a detailed medical sketch of human lungs depicting a collapsed lung and chest cavity air accumulation highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to a brass chest needle, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Sfregio": "Digital painting viewed from directly above, top-down perspective, an ancient illuminated parchment depicting a detailed profile drawing of a scarred face, highlighting a jagged, deep facial wound across the cheek and eye in faded crimson ink, lying flat on a dark rough textured stone surface next to a needle and thread, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Shock Settico": "Digital painting viewed from directly above, top-down perspective, an ancient gritty parchment detailing the symptoms of blood poisoning, depicting a medical sketch of dark, spreading infected veins throughout the body highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to a vial of purifying herbs, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Spina Dorsale Spezzata": "Digital painting viewed from directly above, top-down perspective, an ancient gritty anatomical parchment showing a detailed medical sketch of the human spine depicting shattered vertebrae and a severed spinal cord highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to complex surgical traction tools, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus.",
    "Stomaco Lacerato": "Digital painting viewed from directly above, top-down perspective, an ancient gritty anatomical parchment showing a detailed medical sketch of the human stomach depicting a deep internal wall laceration highlighted in faded crimson ink, lying flat on a dark rough textured stone surface next to an apothecary jar of healing salve, dark fantasy style, Witcher universe aesthetic, moody lighting, high contrast, 1024x1024, sharp focus."
};

function main() {
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
    
    let md = `# 📊 REPORT FERITE CRITICHE - ICONOGRAFIA & ASSET AUDIT\n\n`;
    md += `Questo report elenca tutti gli asset presenti all'interno del compendio **Ferite Critiche (witcher-critical-wounds)**, tracciando lo stato delle immagini associate e i relativi prompt consigliati per la generazione AI.\n\n`;
    
    md += `## 📋 Tabella Audit Completo (14 Asset)\n\n`;
    md += `| Nome Asset | Path Immagine | Nome Immagine | Stato Icona | Prompt Consigliato / Note |\n`;
    md += `| :--- | :--- | :--- | :---: | :--- |\n`;
    
    // Track placeholders by size to show exact audit status
    const sizesMap = {
        "braccio_fratturato.webp": 10186,
        "gamba_fratturata.webp": 10186,
        "costole_incrinate.webp": 10446,
        "costole_rotte.webp": 10446,
        "danni_cardiaci.webp": 10446,
        "milza_lesionata.webp": 10446,
        "pneumotorace.webp": 10446,
        "shock_settico.webp": 10446,
        "stomaco_lacerato.webp": 10446,
        "mascella_incrinata.webp": 18248,
        "occhio_danneggiato.webp": 18248,
        "sfregio.webp": 18248,
        "decapitazione.webp": 15928,
        "spina_dorsale_spezzata.webp": 34354
    };

    for (const file of files) {
        const filePath = path.join(srcDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const name = data.name;
        const img = data.img;
        const imgName = path.basename(img);
        
        let status = "⚠️ Placeholder";
        let note = "Condiviso con altri oggetti (doppione byte-per-byte)";
        if (imgName === "decapitazione.webp") {
            status = "⚠️ Placeholder";
            note = "Immagine temporanea non ottimizzata";
        } else if (imgName === "spina_dorsale_spezzata.webp") {
            status = "⚠️ Placeholder";
            note = "Immagine temporanea non ottimizzata";
        }
        
        const prompt = promptTemplates[name] || "Nessun prompt definito.";
        
        md += `| **${name}** | \`${img}\` | \`${imgName}\` | ${status} | 🔍 **Da Generare AI** \\| **Prompt**: \`${prompt}\` |\n`;
    }
    
    md += `\n---\n\n`;
    md += `## 👥 Tracciamento Generazione Immagini Ferite Critiche\n\n`;
    md += `| Stato | Nome Ferita | File Target | Prompt Utilizzato |\n`;
    md += `| :---: | :--- | :--- | :--- |\n`;
    
    for (const file of files) {
        const filePath = path.join(srcDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const name = data.name;
        const img = data.img;
        const imgName = path.basename(img);
        const prompt = promptTemplates[name] || "";
        
        md += `| [ ] | **${name}** | \`${imgName}\` | ${prompt} |\n`;
    }
    
    md += `\n*Report creato automaticamente in data: ${new Date().toLocaleDateString('it-IT')}.*\n`;
    
    fs.writeFileSync(reportPath, md, 'utf8');
    console.log(`Successfully generated critical wounds report at: ${reportPath}`);
}

main();
