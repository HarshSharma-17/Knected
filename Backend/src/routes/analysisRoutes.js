/**
 * Purpose:
 * Defines API routes for project analysis.
 *
 * Responsibilities:
 * - Expose the project analysis endpoint
 * - Forward requests to analysisController
 */

const express = require("express");

const {
    analyzeProject,
} = require("../controllers/analysisController");

const router = express.Router();

// Analyze project
router.post("/", analyzeProject);

module.exports = router;