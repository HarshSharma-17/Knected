/**
 * ============================================================================
 * File: graphController.js
 * Path: Backend/src/controllers/graphController.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Handles dependency graph requests for saved projects.
 *
 * Responsibilities:
 * - Find the requested project
 * - Verify that the project belongs to the logged-in user
 * - Return the saved dependency graph
 * ============================================================================
 */

const Project = require("../models/Project");

// ============================================================================
// Get dependency graph of a project
// ============================================================================

const getProjectGraph = async (req, res) => {
    try {
        const projectId = req.params.id;

        console.log("Graph request received");
        console.log("Project ID:", projectId);

        // Find project belonging to logged-in user
        const project = await Project.findOne({
            _id: projectId,
            userId: req.user.userId,
        });

        // Project not found
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // Get graph from saved analysis
        const graph = project.analysis?.graph || {
            nodes: [],
            edges: [],
        };

        console.log(
            "Graph fetched:",
            graph.nodes.length,
            "nodes,",
            graph.edges.length,
            "edges"
        );

        return res.status(200).json({
            success: true,
            message: "Dependency graph fetched successfully",
            data: graph,
        });

    } catch (error) {
        console.error("GRAPH CONTROLLER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch dependency graph",
        });
    }
};

// ============================================================================
// Export
// ============================================================================

module.exports = {
    getProjectGraph,
};