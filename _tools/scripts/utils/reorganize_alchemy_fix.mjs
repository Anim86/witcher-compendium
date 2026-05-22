import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../..");
const MD_FILE = path.join(REPO_ROOT, "TO DO/riorganizzazione alchimia.md");
const ALCHIMIA_DIR = path.join(REPO_ROOT, "_tools/src-packs/ALCHIMIA_E_ARTIGIANATO");

async function run() {
  console.log("📂 Loading master table from markdown...");
  const mdContent = await fs.readFile(MD_FILE, "utf-8");
  const lines = mdContent.split(/\r?\n/);
  
  const expectedItems = [];
  let tableStarted = false;
  
  for (const line of lines) {
    if (line.includes("| Nome Asset |")) {
      tableStarted = true;
      continue;
    }
    if (tableStarted) {
      if (!line.includes("|")) continue;
      if (line.includes("| :---")) continue;
      
      const parts = line.split("|").map(p => p.trim());
      if (parts.length >= 5) {
        const name = parts[1].replace(/`/g, "");
        const compendium = parts[2].replace(/`/g, "");
        const subCategory = parts[3].replace(/`/g, "");
        const mechanicType = parts[4].replace(/`/g, "");
        
        if (name && compendium) {
          expectedItems.push({
            name,
            compendium,
            subCategory,
            mechanicType
          });
        }
      }
    }
  }
  console.log(`Parsed ${expectedItems.length} items from markdown table.`);
  
  // Scan existing JSON files
  console.log(`Scanning JSON files in ${ALCHIMIA_DIR}...`);
  const actualItems = [];
  const dirs = await fs.readdir(ALCHIMIA_DIR);
  
  for (const dirName of dirs) {
    const dirPath = path.join(ALCHIMIA_DIR, dirName);
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) continue;
    
    const files = await fs.readdir(dirPath);
    for (const fileName of files) {
      if (!fileName.endsWith(".json")) continue;
      const filePath = path.join(dirPath, fileName);
      const content = await fs.readFile(filePath, "utf-8");
      try {
        const json = JSON.parse(content);
        actualItems.push({
          name: json.name,
          type: json.type,
          compendium: dirName,
          fileName,
          filePath
        });
      } catch (err) {
        console.error(`Error parsing JSON file ${filePath}:`, err.message);
      }
    }
  }
  console.log(`Found ${actualItems.length} JSON files.`);
  
  // Index actual items by name and clean name
  const actualMap = new Map();
  for (const item of actualItems) {
    actualMap.set(item.name, item);
  }
  
  const cleanName = (n) => n.toLowerCase().replace(/[^a-z0-9]/g, "");
  const actualCleanMap = new Map();
  for (const item of actualItems) {
    actualCleanMap.set(cleanName(item.name), item);
  }
  
  let movedCount = 0;
  let typeUpdatedCount = 0;
  
  for (const exp of expectedItems) {
    let act = actualMap.get(exp.name);
    if (!act) {
      act = actualCleanMap.get(cleanName(exp.name));
    }
    
    if (!act) {
      console.warn(`⚠️ Warning: "${exp.name}" expected but not found in any JSON source files.`);
      continue;
    }
    
    let currentPath = act.filePath;
    
    // Check if compendium directory is correct
    if (act.compendium !== exp.compendium) {
      const targetDir = path.join(ALCHIMIA_DIR, exp.compendium);
      const targetPath = path.join(targetDir, act.fileName);
      
      console.log(`📦 Moving "${exp.name}" from ${act.compendium} to ${exp.compendium}...`);
      await fs.rename(currentPath, targetPath);
      
      // Update our tracking
      currentPath = targetPath;
      act.compendium = exp.compendium;
      act.filePath = targetPath;
      movedCount++;
    }
    
    // Check if mechanical type is correct inside JSON
    const fileContent = await fs.readFile(currentPath, "utf-8");
    const json = JSON.parse(fileContent);
    
    if (json.type !== exp.mechanicType) {
      console.log(`🔧 Updating type for "${exp.name}": "${json.type}" ➡️ "${exp.mechanicType}"`);
      json.type = exp.mechanicType;
      
      // Save changes back to disk
      await fs.writeFile(currentPath, JSON.stringify(json, null, 2) + "\n", "utf-8");
      typeUpdatedCount++;
    }
  }
  
  console.log(`\n🎉 Reorganization Alignment completed:`);
  console.log(`   - Files moved: ${movedCount}`);
  console.log(`   - Types updated: ${typeUpdatedCount}`);
}

run().catch(console.error);
