/**
 * ============================================================================
 * File: uploadRoutes.js
 * Path: Backend/src/routes/uploadRoutes.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Defines API routes related to project uploads.
 *
 * Responsibilities:
 * - Connect upload endpoint to Multer
 * - Connect upload endpoint to uploadController
 *
 * Author: Harsh Sharma
 * Project: Knected - AI Code Dependency Visualizer
 * ============================================================================
 */

const express = require("express");

const upload = require("../config/upload");
const {
    uploadProject,
} = require("../controllers/uploadController");

const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * Upload a project ZIP file.
 *
 * @route POST /api/upload
 * @access Public
 */
router.post(
    "/",
    authMiddleware,
    upload.single("project"),
    uploadProject
);

module.exports = router;