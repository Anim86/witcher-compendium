import sharp from 'sharp';
import process from 'process';

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
    console.error('Usage: node convert_tmp.mjs <input> <output>');
    process.exit(1);
}

sharp(inputPath)
    .resize(512, 512)
    .webp({ quality: 90 })
    .toFile(outputPath)
    .then(() => {
        console.log(`Converted ${inputPath} to ${outputPath}`);
    })
    .catch(err => {
        console.error(`Error converting image: ${err}`);
        process.exit(1);
    });
