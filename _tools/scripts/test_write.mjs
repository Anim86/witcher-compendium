import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { Jimp } = require('jimp');

async function test() {
    const src = '../../witcher-compendium/images/races/elfo.png'; // One of the known files
    const dest = '../../witcher-compendium/assets/optimized/test_elfo.webp';
    
    try {
        console.log('Reading:', src);
        const image = await Jimp.read(src);
        console.log('Read success, size:', image.bitmap.width, 'x', image.bitmap.height);
        
        console.log('Writing to:', dest);
        // Let's try the newer v1 method if write doesn't work on the object
        if (image.write) {
            await image.write(dest);
            console.log('image.write success');
        } else {
            console.log('image.write missing, checking exported write function');
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
