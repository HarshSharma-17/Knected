/**
 * ============================================================================
 * File: aiController.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Handles AI-related project analysis requests.
 *
 * Responsibilities:
 * - Get a user's project
 * - Verify project ownership
 * - Send project analysis to Knected AI
 * - Return the generated AI summary
 * ============================================================================
 */

const Project = require("../models/Project");

const {
    generateProjectSummary,
    generateDependencyExplanation,
    generateArchitectureInsights,
    askKnected,
} = require("../services/aiService");

/**
 * Generate an AI summary for a project.
 *
 * Route:
 * POST /api/ai/projects/:id/summary
 */
const generateSummary = async (req, res, next) => {

    try {

        const projectId = req.params.id;

        const userId = req.user.userId;


        // Find the project belonging to the logged-in user
        const project = await Project.findOne({
            _id: projectId,
            userId: userId,
        });


        if (!project) {

            return res.status(404).json({
                success: false,
                message: "Project not found.",
            });
        }


        // Make sure analysis data exists
        if (!project.analysis) {

            return res.status(400).json({
                success: false,
                message: "Project analysis is not available.",
            });
        }


        // Generate AI summary
        const summary = await generateProjectSummary(
            project.analysis
        );


        return res.status(200).json({

            success: true,

            message:
                "AI project summary generated successfully.",

            data: {
                projectId: project._id,
                summary: summary,
            },
        });

    } catch (error) {

        next(error);
    }
};

/**
 * Generate an AI explanation for a dependency.
 *
 * Route:
 * POST /api/ai/projects/:id/dependency-explanation
 */
const explainDependency = async (req, res, next) => {

    try {

        const projectId = req.params.id;

        const userId = req.user.userId;

        const {
            source,
            target,
        } = req.body;


        // Validate request body
        if (!source || !target) {

            return res.status(400).json({
                success: false,
                message:
                    "Source and target files are required.",
            });
        }


        // Find project belonging to logged-in user
        const project = await Project.findOne({
            _id: projectId,
            userId: userId,
        });


        if (!project) {

            return res.status(404).json({
                success: false,
                message: "Project not found.",
            });
        }


        // Make sure graph exists
        if (
            !project.analysis ||
            !project.analysis.graph
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Project dependency graph is not available.",
            });
        }


        // Check that this dependency actually exists
        const dependencyExists =
            project.analysis.graph.edges.some(
                (edge) =>
                    edge.source === source &&
                    edge.target === target
            );


        if (!dependencyExists) {

            return res.status(404).json({
                success: false,
                message:
                    "Dependency relationship not found in project graph.",
            });
        }


        // Generate explanation
        const explanation =
            await generateDependencyExplanation({
                source,
                target,
            });


        return res.status(200).json({

            success: true,

            message:
                "AI dependency explanation generated successfully.",

            data: {
                projectId: project._id,
                source,
                target,
                explanation,
            },
        });

    } catch (error) {

        next(error);
    }
};

/**
 * Generate AI insights for project architecture.
 *
 * Route:
 * POST /api/ai/projects/:id/architecture
 */
const analyzeArchitecture = async (req, res, next) => {

    try {

        const projectId = req.params.id;

        const userId = req.user.userId;


        // Find project belonging to logged-in user
        const project = await Project.findOne({
            _id: projectId,
            userId: userId,
        });


        if (!project) {

            return res.status(404).json({
                success: false,
                message: "Project not found.",
            });
        }


        // Make sure graph exists
        if (
            !project.analysis ||
            !project.analysis.graph
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Project dependency graph is not available.",
            });
        }


        const {
            nodes = [],
            edges = [],
        } = project.analysis.graph;


        // ----------------------------------------------------------------------
        // Calculate architecture metrics
        // ----------------------------------------------------------------------

        const dependencyCounts = {};

        nodes.forEach((node) => {
            dependencyCounts[node.id] = {
                id: node.id,
                name: node.name,
                outgoing: 0,
                incoming: 0,
                totalConnections: 0,
            };
        });


        edges.forEach((edge) => {

            if (dependencyCounts[edge.source]) {
                dependencyCounts[edge.source].outgoing++;
            }

            if (dependencyCounts[edge.target]) {
                dependencyCounts[edge.target].incoming++;
            }
        });


        Object.values(dependencyCounts).forEach((file) => {

            file.totalConnections =
                file.outgoing +
                file.incoming;
        });


        // Sort files by total number of connections
        const mostConnectedFiles =
            Object.values(dependencyCounts)
                .sort(
                    (a, b) =>
                        b.totalConnections -
                        a.totalConnections
                )
                .slice(0, 10);


        // Files with many outgoing dependencies
        const highDependencyFiles =
            Object.values(dependencyCounts)
                .filter(
                    (file) => file.outgoing > 0
                )
                .sort(
                    (a, b) =>
                        b.outgoing -
                        a.outgoing
                )
                .slice(0, 10);


        // Files depended on by many other files
        const highlyReferencedFiles =
            Object.values(dependencyCounts)
                .filter(
                    (file) => file.incoming > 0
                )
                .sort(
                    (a, b) =>
                        b.incoming -
                        a.incoming
                )
                .slice(0, 10);


        const architectureData = {

            project: {
                id: project._id,
                sourceType: project.sourceType,
                name:
                    project.originalName ||
                    project.githubRepo ||
                    "Unnamed project",
            },

            graphStatistics: {
                totalFiles: nodes.length,
                totalDependencies: edges.length,
            },

            mostConnectedFiles,

            highDependencyFiles,

            highlyReferencedFiles,
        };


        // ----------------------------------------------------------------------
        // Ask AI to interpret the calculated architecture data
        // ----------------------------------------------------------------------

        const insights =
            await generateArchitectureInsights(
                architectureData
            );


        return res.status(200).json({

            success: true,

            message:
                "AI architecture insights generated successfully.",

            data: {
                projectId: project._id,
                insights,
                metrics: architectureData,
            },
        });

    } catch (error) {

        next(error);
    }
};


/**
 * Answer a question about a Knected project.
 *
 * Route:
 * POST /api/ai/projects/:id/ask
 */
const askProject = async (req, res, next) => {

    try {

        const projectId = req.params.id;
        const userId = req.user.userId;

        const { question } = req.body;


        // Validate question
        if (
            !question ||
            typeof question !== "string" ||
            !question.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Question is required.",
            });
        }


        // Find project belonging to logged-in user
        const project = await Project.findOne({
            _id: projectId,
            userId: userId,
        });


        if (!project) {

            return res.status(404).json({
                success: false,
                message: "Project not found.",
            });
        }


        // Make sure analysis exists
        if (!project.analysis) {

            return res.status(400).json({
                success: false,
                message:
                    "Project analysis is not available.",
            });
        }


        // ----------------------------------------------------------------------
        // Build AI context
        // ----------------------------------------------------------------------

        const analysis = project.analysis;


        const projectContext = {

            project: {
                id: project._id,
                name:
                    project.originalName ||
                    project.githubRepo ||
                    "Unnamed project",
                sourceType: project.sourceType,
            },

            files: analysis.files || [],

            graph: {
                nodes:
                    analysis.graph?.nodes || [],

                edges:
                    analysis.graph?.edges || [],
            },

        };


        // ----------------------------------------------------------------------
        // Ask Knected AI
        // ----------------------------------------------------------------------

        const answer = await askKnected({
            question: question.trim(),
            projectAnalysis: projectContext,
        });


        return res.status(200).json({

            success: true,

            message:
                "Knected AI answered successfully.",

            data: {
                projectId: project._id,
                question: question.trim(),
                answer,
            },

        });

    } catch (error) {

        next(error);
    }
};


module.exports = {
    generateSummary,
    explainDependency,
    analyzeArchitecture,
    askProject,
};