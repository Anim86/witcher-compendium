import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const files = [
    { src: 'C:\\Users\\apaci\\.gemini\\antigravity\\brain\\05e491e7-502a-4597-8e30-b1722db42ab2\\tattica_icon_1778959895456.png', dest: 'tattica.webp' },
    { src: 'C:\\Users\\apaci\\.gemini\\antigravity\\brain\\05e491e7-502a-4597-8e30-b1722db42ab2\\tempra_icon_1778959906526.png', dest: 'tempra.webp' }
];

const outputDir = 'c:\\Users\\apaci\\Desktop\\Script\\witcher-compendium-main\\witcher-compendium\\assets\\REGOLAMENTO_E_NARRATIVA\\Professioni_e_Abilita\\witcher-skills\\';

async function convert() {
    for (const file of files) {
        console.log(`Converting ${file.src} to ${file.dest}...`);
        await sharp(file.src)
            .resize(512, 512)
            .webp({ quality: 85 })
            .toFile(path.join(outputDir, file.dest));
        console.log(`Done!`);
    }
}

convert().catch(err => {
    console.error(err);
    process.exit(1);
});
