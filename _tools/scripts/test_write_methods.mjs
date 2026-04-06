import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Jimp } = require('jimp');

async function test() {
    const src = '../../witcher-compendium/images/races/elfo.png';
    try {
        const image = await Jimp.read(src);
        console.log('Jimp image keys:', Object.keys(image));
        // Check for common methods
        for (const key of ['write', 'writeAsync', 'getBuffer', 'resize']) {
            if (image[key]) console.log(`Method ${key} exists`);
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
}
test();
