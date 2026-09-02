/**
 * ============================================================================
 * File: projectRoutes.js
 * Path: Backend/src/routes/projectRoutes.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Defines API routes related to uploaded projects.
 * ============================================================================
 */

const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    getUserProjects,getProjectById,getProjectGraph,deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

// Get projects belonging to logged-in user
router.get("/", authMiddleware, getUserProjects);
router.get("/:id/graph", authMiddleware, getProjectGraph);
router.get("/:id", authMiddleware, getProjectById);
router.delete("/:id", authMiddleware, deleteProject);
module.exports = router;