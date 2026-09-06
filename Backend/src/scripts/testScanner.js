/**
 * Purpose:
 * Tests the Knected project scanner.
 *
 * Responsibilities:
 * - Load an extracted project
 * - Run the scanner
 * - Display discovered source files
 */

const {
    scanProject,
} = require("../services/projectScannerService");

const projectPath = process.argv[2];

// Validate project path
if (!projectPath) {
    console.log(
        "Usage: node scripts/testScanner.js <project-path>"
    );
    process.exit(1);
}

// Scan project
const files = scanProject(projectPath);

console.log(`Found ${files.length} source files:\n`);

console.table(files);