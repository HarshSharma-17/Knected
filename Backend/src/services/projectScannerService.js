/**
 * Purpose:
 * Scans an extracted project and collects supported source files.
 *
 * Responsibilities:
 * - Recursively scan project directories
 * - Ignore unnecessary directories
 * - Identify supported source files
 * - Return file metadata
 */

const fs = require("fs");
const path = require("path");

// Directories to ignore
const IGNORED_DIRECTORIES = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".next",
    ".vite",
    "__pycache__",
]);

// Supported source file extensions
const SUPPORTED_EXTENSIONS = new Set([
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
]);

// Scan project
const scanProject = (projectPath) => {
    const files = [];

    // Scan directory recursively
    const scanDirectory = (currentPath) => {
        const entries = fs.readdirSync(currentPath, {
            withFileTypes: true,
        });

        for (const entry of entries) {
            const fullPath = path.join(
                currentPath,
                entry.name
            );

            // Ignore unnecessary directories
            if (
                entry.isDirectory() &&
                IGNORED_DIRECTORIES.has(entry.name)
            ) {
                continue;
            }

            // Scan subdirectory
            if (entry.isDirectory()) {
                scanDirectory(fullPath);
                continue;
            }

            // Get file extension
            const extension = path.extname(
                entry.name
            ).toLowerCase();

            // Ignore unsupported files
            if (!SUPPORTED_EXTENSIONS.has(extension)) {
                continue;
            }

            const stats = fs.statSync(fullPath);

            // Add source file information
            files.push({
                name: entry.name,
                path: path.relative(
                    projectPath,
                    fullPath
                ),
                extension,
                size: stats.size,
            });
        }
    };

    scanDirectory(projectPath);

    return files;
};

module.exports = {
    scanProject,
};