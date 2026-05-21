import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const source = '../../../temp_images/warg.png';
const destination = '../../../witcher-compendium/assets/BESTIARIO/witcher-animals/warg.webp';

async function run() {
  const sourcePath = path.resolve(import.meta.dirname, source);
  const destPath = path.resolve(import.meta.dirname, destination);

  console.log(`Loading image from ${sourcePath}`);
  if (!fs.existsSync(sourcePath)) {
    console.error("Source file does not exist");
    return;
  }
  
  console.log("Optimizing...");
  await sharp(sourcePath)
    .resize({
      width: 512,
      height: 512,
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 82 })
    .toFile(destPath);
  
  console.log(`Success! Optimized image saved to ${destPath}`);
  const stats = fs.statSync(destPath);
  console.log(`File size: ${stats.size} bytes`);
}

run().catch(console.error);
