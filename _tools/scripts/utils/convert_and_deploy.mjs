import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const srcPath = process.argv[2];
const destPath = process.argv[3];

if (!srcPath || !destPath) {
    console.error("Usage: node convert_and_deploy.mjs <srcPngPath> <destWebpPath>");
    process.exit(1);
}

const destDir = path.dirname(destPath);
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const tempOutDir = path.resolve('./temp_deploy');
if (!fs.existsSync(tempOutDir)) fs.mkdirSync(tempOutDir);

try {
    const cmd = `npx -y sharp-cli -i "${srcPath}" -o "${tempOutDir}" --format webp --quality 80 resize 512 512`;
    console.log(`Running: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    
    const srcName = path.parse(srcPath).name;
    const generatedName = srcName + ".webp";
    const generatedPath = path.join(tempOutDir, generatedName);
    
    if (fs.existsSync(generatedPath)) {
        if (fs.existsSync(destPath)) {
            fs.unlinkSync(destPath);
        }
        fs.copyFileSync(generatedPath, destPath);
        fs.unlinkSync(generatedPath);
        console.log(`✅ Successfully converted and copied to ${destPath}`);
    } else {
        console.error(`❌ Error: generated file not found at ${generatedPath}`);
        process.exit(1);
    }
} catch (err) {
    console.error(`❌ Error processing image: ${err.message}`);
    process.exit(1);
}
