#!/usr/bin/env node
/**
 * Riorganizzazione Alchimia: Split e Type Update
 * 1. witcher-alchemy → split in witcher-potions + witcher-formulas
 * 2. Aggiorna types secondo report
 */

import fs from "fs/promises";
import path from "path";

const REPO_ROOT = process.cwd();
const ALCHIMIA_DIR = path.join(
  REPO_ROOT,
  "_tools/src-packs/ALCHIMIA_E_ARTIGIANATO"
);

console.log("📂 REPO_ROOT:", REPO_ROOT);
console.log("📂 ALCHIMIA_DIR:", ALCHIMIA_DIR);

const operations = [
  {
    name: "Split witcher-alchemy",
    dir: path.join(ALCHIMIA_DIR, "witcher-alchemy"),
    target: "witcher-alchemy",
    rules: [
      {
        condition: (file, json) => file.includes("formula"),
        targetDir: "witcher-formulas",
        type: "diagrams",
      },
      {
        condition: () => true, // default
        targetDir: "witcher-potions",
        type: "valuable",
      },
    ],
  },
  {
    name: "Update witcher-components",
    dir: path.join(ALCHIMIA_DIR, "witcher-components"),
    target: "witcher-components",
    rules: [
      {
        condition: (file, json) => json.name && json.name.startsWith("Puro"),
        type: "valuable",
      },
      {
        condition: () => true,
        type: "component",
      },
    ],
  },
  {
    name: "Update witcher-schematics",
    dir: path.join(ALCHIMIA_DIR, "witcher-schematics"),
    type: "diagrams",
  },
  {
    name: "Update witcher-mutations",
    dir: path.join(ALCHIMIA_DIR, "witcher-mutations"),
    type: "mutagen",
  },
  {
    name: "Update witcher-mutazioni-tc",
    dir: path.join(ALCHIMIA_DIR, "witcher-mutazioni-tc"),
    type: "valuable",
  },
];

async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

async function processOperation(op) {
  console.log(`\n📦 ${op.name}`);
  console.log(`   Dir: ${op.dir}`);

  try {
    await fs.access(op.dir);
  } catch {
    console.log(`   ⚠️  Directory not found, skipping`);
    return { updated: 0, moved: 0 };
  }

  const files = await fs.readdir(op.dir);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  let updated = 0;
  let moved = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(op.dir, file);
    const content = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(content);

    // Determina il tipo target
    let targetType = op.type;
    let targetDir = op.dir; // default: stay in same dir
    let rule = null;

    if (op.rules) {
      for (const r of op.rules) {
        if (r.condition(file, json)) {
          targetType = r.type;
          if (r.targetDir) {
            targetDir = path.join(ALCHIMIA_DIR, r.targetDir);
          }
          rule = r;
          break;
        }
      }
    }

    // Crea la directory target se necessario
    if (targetDir !== op.dir) {
      await ensureDir(targetDir);
    }

    // Aggiorna il tipo nel JSON
    json.type = targetType;
    const targetPath = path.join(targetDir, file);

    // Salva il file
    await fs.writeFile(targetPath, JSON.stringify(json, null, 2) + "\n");

    // Se il file è stato spostato, rimuovi l'originale (se in directory diversa)
    if (targetPath !== filePath) {
      await fs.unlink(filePath);
      console.log(
        `   ✓ ${file} → ${path.basename(targetDir)} [type: ${targetType}]`
      );
      moved++;
    } else {
      console.log(`   ✓ ${file} [type: ${targetType}]`);
      updated++;
    }
  }

  console.log(`   ✅ Updated: ${updated}, Moved: ${moved}`);
  return { updated, moved };
}

async function main() {
  console.log("🔧 Alchemy Reorganization (Split + Type Update)\n");

  let totalUpdated = 0;
  let totalMoved = 0;

  for (const op of operations) {
    const result = await processOperation(op);
    totalUpdated += result.updated;
    totalMoved += result.moved;
  }

  console.log("\n" + "=".repeat(60));
  console.log(`📊 SUMMARY: Updated ${totalUpdated}, Moved ${totalMoved}`);
  console.log("=".repeat(60));
}

main().catch(console.error);
