const fs = require('fs');
const path = require('path');

const workListPath = 'e:/AntigravitiProgetti/CompendioTheWitcher/scratch/work_list.json';
const imagesDir = 'e:/AntigravitiProgetti/CompendioTheWitcher/temp_images/witcher-alchemy/';

const workList = JSON.parse(fs.readFileSync(workListPath, 'utf8'));
const existingImages = fs.readdirSync(imagesDir).map(f => f.toLowerCase());

const alchemyItems = workList['witcher-alchemy'];

const missingAlchemy = alchemyItems.filter(item => {
    // Some filenames in work_list might have .webp, but we generate .png
    const targetPng = item.filename.replace(/\.webp$/i, '.png').toLowerCase();
    // Also handle "Formula_" prefix normalization if needed
    const normalizedName = item.name.toLowerCase().replace(/[:']/g, '').replace(/\s+/g, '_');
    
    // Check if either the filename (as png) or a normalized version exists
    return !existingImages.includes(targetPng) && !existingImages.includes(normalizedName + '.png');
});

console.log(`Missing Alchemy Items: ${missingAlchemy.length}`);
missingAlchemy.slice(0, 50).forEach((item, index) => {
    console.log(`${index + 1}: ${item.name} (${item.filename})`);
});
