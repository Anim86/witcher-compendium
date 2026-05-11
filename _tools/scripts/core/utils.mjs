import fs from 'fs';
import path from 'path';

/**
 * Standard slugify function for the Witcher Compendium.
 * Replaces special characters, spaces, and punctuation with a single underscore.
 * Ensures consistent lowercase naming.
 * Example: "Spada d'Argento" -> "spada_d_argento"
 */
export function slugify(text) {
    if (!text) return "";
    return text.toString().toLowerCase()
        .normalize('NFD') // Decompose accents (e.g., à -> a + `)
        .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
        .replace(/['"«»„“”]/g, '_') // Replace common quotes and apostrophes with underscore
        .replace(/[^\w\s-]/g, '_') // Replace any other non-word char with underscore
        .replace(/[-\s]+/g, '_') // Replace spaces and dashes with underscore
        .replace(/__+/g, '_') // Collapse multiple underscores
        .replace(/^_|_$/g, ''); // Trim leading/trailing underscores
}

/**
 * Recursively gets all files in a directory.
 */
export function getFiles(dir, filter = () => true) {
    let results = [];
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(filePath, filter));
        } else if (filter(file, filePath)) {
            results.push(filePath);
        }
    });
    return results;
}
