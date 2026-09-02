/**
 * ============================================================================
 * File: projectController.js
 * Path: Backend/src/controllers/projectController.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Handles project-related API operations.
 * ============================================================================
 */

const Project = require("../models/Project");
const fs = require("fs");
const path = require("path");
// ============================================================================
// Get all projects of logged-in user
// ============================================================================

const getUserProjects = async (req, res) => {
    try {
        console.log("Fetching projects for user:", req.user.userId);

        const projects = await Project.find({
            userId: req.user.userId,
        })
            .sort({ createdAt: -1 })
            .select("-analysis");

        return res.status(200).json({
            success: true,
            message: "Projects fetched successfully",
            data: projects,
        });

    } catch (error) {
        console.error("Get projects error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch projects",
        });
    }
};

// ============================================================================
// Get a single project of the logged-in user
// ============================================================================

const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Fetching project:", id);
        console.log("User:", req.user.userId);

        const project = await Project.findOne({
            _id: id,
            userId: req.user.userId,
        });

        // Project not found OR does not belong to this user
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project fetched successfully",
            data: project,
        });

    } catch (error) {
        console.error("Get project error:", error);

        // Invalid MongoDB ObjectId
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch project",
        });
    }
};

// ============================================================================
// Delete a single project of the logged-in user
// Also removes the uploaded ZIP file from the server
// ============================================================================

const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Deleting project:", id);
        console.log("User:", req.user.userId);

        // Find project and verify ownership
        const project = await Project.findOne({
            _id: id,
            userId: req.user.userId,
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // --------------------------------------------------------------------
        // Delete uploaded ZIP file
        // --------------------------------------------------------------------

        if (project.fileName) {
            const uploadPath = path.join(
                __dirname,
                "..",
                "uploads",
                project.fileName
            );

            if (fs.existsSync(uploadPath)) {
                fs.unlinkSync(uploadPath);
                console.log("Uploaded ZIP deleted:", uploadPath);
            } else {
                console.log("Uploaded ZIP not found:", uploadPath);
            }
        }

        // --------------------------------------------------------------------
        // Delete project from MongoDB
        // --------------------------------------------------------------------

        await Project.deleteOne({
            _id: id,
            userId: req.user.userId,
        });

        console.log("Project deleted from MongoDB:", id);

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });

    } catch (error) {
        console.error("Delete project error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete project",
        });
    }
};

// ============================================================================
// Get dependency graph of a project
// ============================================================================

const getProjectGraph = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Fetching graph for project:", id);
        console.log("User:", req.user.userId);

        // Find project and verify ownership
        const project = await Project.findOne({
            _id: id,
            userId: req.user.userId,
        }).select("analysis.graph");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Dependency graph fetched successfully",
            data: project.analysis.graph,
        });

    } catch (error) {
        console.error("Get project graph error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dependency graph",
        });
    }
};
module.exports = {
    getUserProjects,
    getProjectById,
    getProjectGraph,
    deleteProject,
};