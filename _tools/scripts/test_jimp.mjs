import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Jimp = require('jimp');

console.log('Jimp (CJS) loaded:', typeof Jimp);
if (Jimp.read) {
    console.log('Jimp.read exists');
} else {
    console.log('Jimp.read missing, Jimp keys:', Object.keys(Jimp));
}
