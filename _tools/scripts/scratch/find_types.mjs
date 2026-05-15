import fs from 'fs';
import path from 'path';

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, filesList);
    } else if (file.endsWith('.json')) {
      filesList.push(filePath);
    }
  }
  return filesList;
}

const packsDir = 'e:\\AntigravitiProgetti\\CompendioTheWitcher\\witcher-compendium\\packs';
const files = getFiles(packsDir);
const types = new Set();
const folderTypes = new Set();

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (data.type) types.add(data.type);
    if (data._key && !data.type) { // Maybe folder or journal
      if (data.type) types.add(data.type);
    }
  } catch (e) {
  }
}

console.log("Types:", Array.from(types));
