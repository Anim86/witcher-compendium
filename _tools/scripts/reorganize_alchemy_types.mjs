#!/usr/bin/env node
/**
 * Riorganizzazione tipi alchimia secondo report
 * - witcher-potions (36): valuable
 * - witcher-formulas (56): diagrams
 * - witcher-components (146): component (tranne "Puro..." → valuable)
 * - witcher-schematics (158): diagrams
 * - witcher-mutations (35): mutagen
 * - witcher-mutazioni-tc (16): valuable
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "../../..");
const ALCHIMIA_DIR = path.join(
  REPO_ROOT,
  "_tools/src-packs/ALCHIMIA_E_ARTIGIANATO"
);

const typeMapping = {
  "witcher-potions": "valuable",
  "witcher-formulas": "diagrams",
  "witcher-components": "component", // eccezione: Puro* → valuable
  "witcher-schematics": "diagrams",
  "witcher-mutations": "mutagen",
  "witcher-mutazioni-tc": "valuable",
};

async function processDirectory(dirPath, targetType) {
  try {
    const files = await fs.readdir(dirPath);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    let updated = 0;
    for (const file of jsonFiles) {
      const filePath = path.join(dirPath, file);
      const content = await fs.readFile(filePath, "utf-8");
      const json = JSON.parse(content);

      // Determina il tipo target
      let newType = targetType;

      // Eccezione: witcher-components con nome che inizia con "Puro" → valuable
      if (
        targetType === "component" &&
        json.name &&
        json.name.startsWith("Puro")
      ) {
        newType = "valuable";
      }

      // Aggiorna solo se diverso
      if (json.type !== newType) {
        json.type = newType;
        await fs.writeFile(filePath, JSON.stringify(json, null, 2) + "\n");
        console.log(
          `✓ ${file}: type changed to "${newType}" (was "${json.type}")`
        );
        updated++;
      } else {
        console.log(`  ${file}: already type "${newType}"`);
      }
    }

    return { updated, total: jsonFiles.length };
  } catch (err) {
    console.error(`❌ Error processing ${dirPath}:`, err.message);
    return { updated: 0, total: 0, error: err.message };
  }
}

async function main() {
  console.log("🔧 Starting Alchemy Types Reorganization\n");

  let grandTotal = 0;
  let grandUpdated = 0;

  for (const [packDir, targetType] of Object.entries(typeMapping)) {
    const fullPath = path.join(ALCHIMIA_DIR, packDir);
    console.log(`\n📦 Processing: ${packDir} → type: "${targetType}"`);
    console.log(`   Path: ${fullPath}`);

    try {
      await fs.access(fullPath);
      const result = await processDirectory(fullPath, targetType);
      console.log(`   ✅ Updated: ${result.updated}/${result.total}\n`);
      grandTotal += result.total;
      grandUpdated += result.updated;
    } catch {
      console.log(`   ⚠️  Directory not found, skipping\n`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`📊 SUMMARY: Updated ${grandUpdated} / ${grandTotal} files`);
  console.log("=".repeat(60));
}

main().catch(console.error);
