/**
 * ============================================================================
 * File: graphRoutes.js
 * Path: Backend/src/routes/graphRoutes.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Defines API routes related to project dependency graphs.
 *
 * Responsibilities:
 * - Protect graph endpoints with authentication
 * - Connect graph requests to graphController
 * ============================================================================
 */

const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    getProjectGraph,
} = require("../controllers/graphController");

const router = express.Router();

// ============================================================================
// Get dependency graph of a project
// ============================================================================

router.get(
    "/:id",
    authMiddleware,
    getProjectGraph
);

// ============================================================================
// Export
// ============================================================================

module.exports = router;