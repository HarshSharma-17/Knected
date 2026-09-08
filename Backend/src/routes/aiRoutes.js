/**
 * ============================================================================
 * File: aiRoutes.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Defines API routes related to Knected AI.
 * ============================================================================
 */

const express = require("express");

const {
    generateSummary,
    explainDependency,
    analyzeArchitecture,
    askProject,
} = require("../controllers/aiController");

const authMiddleware =
    require("../middleware/authMiddleware");


const router = express.Router();


/**
 * Generate AI summary for a project.
 */
router.post(
    "/projects/:id/summary",
    authMiddleware,
    generateSummary
);
/**
 * Generate AI explanation for a dependency.
 */
router.post(
    "/projects/:id/dependency-explanation",
    authMiddleware,
    explainDependency
);
/**
 * Analyze project architecture using AI.
 */
router.post(
    "/projects/:id/architecture",
    authMiddleware,
    analyzeArchitecture
);
/**
 * Ask Knected AI a question about a project.
 */
router.post(
    "/projects/:id/ask",
    authMiddleware,
    askProject
);
module.exports = router;