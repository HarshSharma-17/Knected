/**
 * ============================================================================
 * File: upload.js
 * Path: Backend/src/config/upload.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Configures Multer for handling project file uploads in Knected.
 *
 * Responsibilities:
 * - Define where uploaded files are stored
 * - Generate safe unique filenames
 * - Limit upload size
 * - Restrict supported file types
 *
 * Note:
 * At this stage, Knected accepts ZIP files only.
 *
 * Author: Harsh Sharma
 * Project: Knected - AI Code Dependency Visualizer
 * ============================================================================
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==============================
// Upload Directory
// ==============================

const uploadDirectory = path.join(__dirname, "../uploads");

// Create the upload directory if it does not exist.
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// ==============================
// Storage Configuration
// ==============================

/**
 * Configure how Multer stores uploaded files.
 */
const storage = multer.diskStorage({
    /**
     * Define the destination directory for uploaded files.
     *
     * @param {Object} req - Express request object.
     * @param {Object} file - Uploaded file information.
     * @param {Function} callback - Multer callback.
     */
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },

    /**
     * Generate a unique filename for the uploaded file.
     *
     * @param {Object} req - Express request object.
     * @param {Object} file - Uploaded file information.
     * @param {Function} callback - Multer callback.
     */
    filename: (req, file, callback) => {
        const timestamp = Date.now();
        const originalName = path
            .parse(file.originalname)
            .name
            .replace(/[^a-zA-Z0-9-_]/g, "_");

        callback(
            null,
            `${originalName}-${timestamp}.zip`
        );
    },
});

// ==============================
// File Validation
// ==============================

/**
 * Allow only ZIP files.
 *
 * @param {Object} req - Express request object.
 * @param {Object} file - Uploaded file information.
 * @param {Function} callback - Multer callback.
 */
const fileFilter = (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension !== ".zip") {
        return callback(
            new Error("Only ZIP files are allowed.")
        );
    }

    callback(null, true);
};

// ==============================
// Multer Configuration
// ==============================

/**
 * Final Multer configuration used by the upload middleware.
 *
 * Maximum project ZIP size:
 * 50 MB
 */
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});

module.exports = upload;