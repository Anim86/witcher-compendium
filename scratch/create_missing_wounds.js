import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const woundsDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/_tools/src-packs/REGOLAMENTO_E_NARRATIVA/witcher-critical-wounds';
const reportPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/TO DO/report_ferite_critiche_asset.md';

const userPrompts = {
    "Braccio Fratturato": "Dark fantasy skill icon, a snapped human arm bone with a visible jagged fracture as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Costole Incrinate": "Dark fantasy skill icon, a human ribcage with a single cracked rib as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Costole Rotte": "Dark fantasy skill icon, a shattered human ribcage with severely broken bones as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Danni Cardiaci": "Dark fantasy skill icon, an anatomically accurate human heart pierced by a jagged line as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Decapitazione": "Dark fantasy skill icon, a severed human skull separated from the cervical spine as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Gamba Fratturata": "Dark fantasy skill icon, a snapped human leg bone with a severe break as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Mascella Incrinata": "Dark fantasy skill icon, a human skull with a fractured jawbone as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Milza Lesionata": "Dark fantasy skill icon, a ruptured spleen organ with a deep gash as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Occhio Danneggiato": "Dark fantasy skill icon, a wide open eye with a vertical scar slashing through the pupil as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Pneumotorace": "Dark fantasy skill icon, a pair of human lungs with one side collapsed and pierced as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Sfregio": "Dark fantasy skill icon, a faceless head profile marked with a massive jagged facial scar as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Shock Settico": "Dark fantasy skill icon, a stylized drop of blood corrupted by spreading toxic veins as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Spina Dorsale Spezzata": "Dark fantasy skill icon, a section of human spine violently snapped in half as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style.",
    "Stomaco Lacerato": "Dark fantasy skill icon, an anatomical stomach organ torn open by a deep wound as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style."
};

const newWounds = [
    {
        name: "Amputazione",
        filename: "amputazione_f92b7c4d12c8a301.json",
        imgName: "amputazione.webp",
        severity: "deadly",
        sourcebook: "MB 161",
        description: "<p>Un arto è stato violentemente reciso dal corpo.</p><p><b>Uscita:</b> La vittima perde l'uso dell'arto e subisce sanguinamento mortale. -4 alle azioni.</p><p><b>Stabilizzato:</b> La vittima subisce -3 alle azioni.</p><p><b>Curato:</b> L'arto è perduto a meno di protesi o magia.</p>",
        prompt: "Dark fantasy skill icon, a violently severed human limb dripping with blood as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style."
    },
    {
        name: "Commozione Cerebrale",
        filename: "commozione_cerebrale_59ac3b1278a9c402.json",
        imgName: "commozione_cerebrale.webp",
        severity: "complex",
        sourcebook: "MB 160",
        description: "<p>Un forte impatto alla testa ha causato una commozione cerebrale.</p><p><b>Uscita:</b> La vittima subisce -3 alle prove basate su INT e RIF e non può lanciare incantesimi.</p><p><b>Stabilizzato:</b> La vittima subisce -2 alle prove basate su INT e RIF.</p><p><b>Curato:</b> La vittima subisce -1 a INT e RIF per 1D10 giorni.</p>",
        prompt: "Dark fantasy skill icon, a human skull vibrating with dizzying impact shockwaves as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style."
    },
    {
        name: "Frattura Esposta",
        filename: "frattura_esposta_7c8d92fa1b03d403.json",
        imgName: "frattura_esposta.webp",
        severity: "difficult",
        sourcebook: "MB 160",
        description: "<p>L'osso si è spezzato fuoriuscendo vistosamente dalla carne.</p><p><b>Uscita:</b> La vittima perde l'uso dell'arto, subisce -4 alle azioni e sanguinamento.</p><p><b>Stabilizzato:</b> La vittima subisce -3 alle azioni.</p><p><b>Curato:</b> La vittima subisce -1 DES permanentemente.</p>",
        prompt: "Dark fantasy skill icon, a broken human limb with a shattered bone violently piercing through the flesh as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style."
    },
    {
        name: "Muscolo Strappato",
        filename: "muscolo_strappato_9d8e7a02b1c4f504.json",
        imgName: "muscolo_strappato.webp",
        severity: "simple",
        sourcebook: "MB 159",
        description: "<p>Le fibre muscolari dell'arto si sono lacerate a causa del trauma.</p><p><b>Uscita:</b> La vittima subisce -2 alle azioni che richiedono l'arto e -2 FIS.</p><p><b>Stabilizzato:</b> La vittima subisce -1 alle azioni che richiedono l'arto.</p><p><b>Curato:</b> La vittima subisce -1 FIS permanentemente.</p>",
        prompt: "Dark fantasy skill icon, a human muscular limb anatomy showing a severely torn and ruptured muscle tissue as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style."
    },
    {
        name: "Rene Lesionato",
        filename: "rene_lesionato_0e1f9d2a3c4b5d05.json",
        imgName: "rene_lesionato.webp",
        severity: "difficult",
        sourcebook: "MB 160",
        description: "<p>Un forte colpo al fianco ha lesionato gravemente un rene.</p><p><b>Uscita:</b> La vittima dimezza la sua VIG, subisce sanguinamento e -3 FIS.</p><p><b>Stabilizzato:</b> La vittima subisce -2 FIS.</p><p><b>Curato:</b> La vittima perde permanentemente 1 VIG.</p>",
        prompt: "Dark fantasy skill icon, an anatomical human kidney torn by a deep bleeding wound as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style."
    },
    {
        name: "Trachea Schiacciata",
        filename: "trachea_schiacciata_3a9b1c7d8e2f4a06.json",
        imgName: "trachea_schiacciata.webp",
        severity: "deadly",
        sourcebook: "MB 161",
        description: "<p>La trachea è stata schiacciata. La vittima soffoca rapidamente.</p><p><b>Uscita:</b> La vittima inizia a soffocare ed è frastornata.</p><p><b>Stabilizzato:</b> La vittima respira faticosamente, subisce -3 FIS e VEL.</p><p><b>Curato:</b> La vittima subisce -1 permanentemente a FIS e VEL.</p>",
        prompt: "Dark fantasy skill icon, a human throat anatomy with a crushed and collapsed windpipe as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style."
    },
    {
        name: "Trauma Cranico",
        filename: "trauma_cranico_8f0a1c3d9e4b2a07.json",
        imgName: "trauma_cranico.webp",
        severity: "difficult",
        sourcebook: "MB 160",
        description: "<p>Una grave frattura con infossamento colpisce il cranio.</p><p><b>Uscita:</b> La vittima è priva di sensi. Se si sveglia, subisce -4 INT e RIF.</p><p><b>Stabilizzato:</b> La vittima subisce -2 INT e RIF.</p><p><b>Curato:</b> La vittima subisce -1 INT permanentemente.</p>",
        prompt: "Dark fantasy skill icon, a human skull with a massive depressed fracture crushing the cranium as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style."
    },
    {
        name: "Coda Mozzata",
        filename: "coda_mozzata_5c2d3a9e1f8b4a08.json",
        imgName: "coda_mozzata.webp",
        severity: "complex",
        sourcebook: "MB 161",
        description: "<p>La coda del mostro è stata tranciata di netto.</p><p><b>Uscita:</b> Il mostro perde qualsiasi attacco con la coda e subisce sanguinamento. -2 alla stabilità.</p><p><b>Stabilizzato:</b> Il mostro non sanguina più ma non ha attacchi con la coda.</p><p><b>Curato:</b> La coda non ricresce.</p>",
        prompt: "Dark fantasy skill icon, a severed reptilian monster tail dripping with blood as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style."
    },
    {
        name: "Danni alle Ali",
        filename: "danni_alle_ali_7f8e2c0b3d1a4e09.json",
        imgName: "danni_alle_ali.webp",
        severity: "complex",
        sourcebook: "MB 160",
        description: "<p>L'ala della creatura è stata strappata o perforata.</p><p><b>Uscita:</b> Il mostro non può volare e subisce -3 VEL.</p><p><b>Stabilizzato:</b> Il mostro non può volare e subisce -2 VEL.</p><p><b>Curato:</b> L'ala guarisce ma lascia ampie cicatrici.</p>",
        prompt: "Dark fantasy skill icon, a torn and pierced leathery bat-like monster wing as a solid white vector-style illustration, centered composition. The subject is placed over a dark slate stone background with realistic cracks and rough texture. Behind the subject, a subtle circular ring of engraved ancient nordic runes. Stone carved square border. Monochromatic grayscale aesthetic, high contrast, clean sharp lines, 2D game UI art style."
    }
];

function generateId() {
    return crypto.randomBytes(8).toString('hex');
}

function main() {
    console.log("🚀 Creating new critical wound DB files...");
    
    for (const w of newWounds) {
        const filePath = path.join(woundsDir, w.filename);
        
        // Skip creating if file already exists
        if (fs.existsSync(filePath)) {
            console.log(`⚠️ DB file already exists: ${w.filename}`);
            continue;
        }
        
        const id = generateId();
        const jsonContent = {
            "name": w.name,
            "type": "criticalWound",
            "system": {
                "severity": w.severity,
                "description": w.description,
                "sourcebook": w.sourcebook
            },
            "img": `modules/witcher-compendium/assets/REGOLAMENTO_E_NARRATIVA/witcher-critical-wounds/${w.imgName}`,
            "effects": [],
            "flags": {},
            "_stats": {
                "systemId": "TheWitcherItaNewSystem",
                "coreVersion": 14,
                "createdTime": Date.now(),
                "modifiedTime": Date.now(),
                "lastModifiedBy": "antigravity"
            },
            "_id": id
        };
        
        fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 4), 'utf8');
        console.log(`✅ Created DB file: ${w.filename} with ID: ${id}`);
    }

    console.log("📝 Generating new report_ferite_critiche_asset.md...");

    const files = fs.readdirSync(woundsDir).filter(f => f.endsWith('.json'));
    
    let md = `# 📊 REPORT FERITE CRITICHE - ICONOGRAFIA & ASSET AUDIT\n\n`;
    md += `Questo report elenca tutti gli asset presenti all'interno del compendio **Ferite Critiche (witcher-critical-wounds)**, inclusi i nuovi elementi humanoidi e di mostri aggiunti per completare integralmente il compendio. Traccia lo stato delle immagini associate e i relativi prompt per la generazione AI.\n\n`;
    
    md += `## 📋 Tabella Audit Completo (${files.length} Asset)\n\n`;
    md += `| Nome Asset | Path Immagine | Nome Immagine | Stato Icona | Prompt Consigliato / Note |\n`;
    md += `| :--- | :--- | :--- | :---: | :--- |\n`;

    const allPrompts = { ...userPrompts };
    for (const w of newWounds) {
        allPrompts[w.name] = w.prompt;
    }

    for (const file of files) {
        const filePath = path.join(woundsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const name = data.name;
        const img = data.img;
        const imgName = path.basename(img);
        
        let status = "⚠️ Placeholder";
        const prompt = allPrompts[name] || "Nessun prompt definito.";
        
        md += `| **${name}** | \`${img}\` | \`${imgName}\` | ${status} | 🔍 **Da Generare AI** \\| **Prompt**: \`${prompt}\` |\n`;
    }
    
    md += `\n---\n\n`;
    md += `## 👥 Tracciamento Generazione Immagini Ferite Critiche\n\n`;
    md += `| Stato | Nome Ferita | File Target | Prompt Utilizzato |\n`;
    md += `| :---: | :--- | :--- | :--- |\n`;
    
    for (const file of files) {
        const filePath = path.join(woundsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const name = data.name;
        const img = data.img;
        const imgName = path.basename(img);
        const prompt = allPrompts[name] || "";
        
        md += `| [ ] | **${name}** | \`${imgName}\` | ${prompt} |\n`;
    }
    
    md += `\n*Report e database aggiornati in data: ${new Date().toLocaleDateString('it-IT')}.*\n`;
    
    fs.writeFileSync(reportPath, md, 'utf8');
    console.log(`Successfully generated updated critical wounds report at: ${reportPath}`);
}

main();
