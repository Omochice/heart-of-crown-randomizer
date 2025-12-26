/**
 * Script to verify that build output is correct.
 * This checks that:
 * 1. Type definition file (.d.mts) exists
 * 2. JavaScript module file (.mjs) exists
 * 3. All expected exports are present in both files
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIST_DIR = join(import.meta.dirname, "..", "dist");
const TYPE_DEF_FILE = join(DIST_DIR, "index.d.mts");
const MODULE_FILE = join(DIST_DIR, "index.mjs");

const EXPECTED_EXPORTS = [
  "createRNG",
  "shuffle",
  "filter",
  "filterByIds",
  "select",
  "validateConstraints",
  "ConstraintConflictError",
  "Constraint",
  "Predicate",
  "SelectOptions",
  "Identifiable",
];

function verifyFileExists(path: string): void {
  if (!existsSync(path)) {
    console.error(`❌ File not found: ${path}`);
    process.exit(1);
  }
  console.log(`✅ File exists: ${path}`);
}

function verifyExports(filePath: string, exports: string[]): void {
  const content = readFileSync(filePath, "utf-8");

  for (const exportName of exports) {
    // Check if export is declared/exported in the file
    const patterns = [
      `export.*${exportName}`,
      `declare.*${exportName}`,
      `interface ${exportName}`,
      `type ${exportName}`,
      `class ${exportName}`,
      `function ${exportName}`,
    ];

    const found = patterns.some((pattern) => new RegExp(pattern).test(content));

    if (!found) {
      console.error(`❌ Export not found in ${filePath}: ${exportName}`);
      process.exit(1);
    }
  }

  console.log(`✅ All ${exports.length} exports found in ${filePath}`);
}

function main(): void {
  console.log("🔍 Verifying build output...\n");

  // Check files exist
  verifyFileExists(TYPE_DEF_FILE);
  verifyFileExists(MODULE_FILE);

  console.log();

  // Check exports
  verifyExports(TYPE_DEF_FILE, EXPECTED_EXPORTS);
  verifyExports(MODULE_FILE, EXPECTED_EXPORTS);

  console.log("\n✅ Build verification passed!");
}

main();
