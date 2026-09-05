/**
 * ============================================================================
 * File: githubController.js
 * Path: Backend/src/controllers/githubController.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Handles GitHub repository requests.
 *
 * Responsibilities:
 * - Receive GitHub repository URL
 * - Clone the repository
 * - Send cloned project to Python analysis engine
 * - Return analysis result to client
 * ============================================================================
 */

const {
    cloneGithubRepository,
} = require("../services/githubService");

const {
    analyzeProjectWithPython,
} = require("../services/pythonAnalysisService");

const Project = require("../models/Project");
// ============================================================================
// Clone and analyze GitHub repository
// ============================================================================

const cloneRepository = async (req, res) => {
    try {

        const { githubUrl } = req.body;


        // Validate GitHub URL
        if (!githubUrl) {
            return res.status(400).json({
                success: false,
                message: "GitHub repository URL is required",
            });
        }


        console.log("GitHub clone request received");
        console.log("Repository URL:", githubUrl);


        // ------------------------------------------------------------
        // Step 1: Clone GitHub repository
        // ------------------------------------------------------------

        const cloneResult =
            await cloneGithubRepository(githubUrl);


        console.log("GitHub repository cloned successfully");
        console.log(
            "Local project path:",
            cloneResult.localPath
        );


        // ------------------------------------------------------------
        // Step 2: Analyze cloned project with Python
        // ------------------------------------------------------------

        console.log("Starting Python analysis...");

        const analysisResult =
            await analyzeProjectWithPython(
                cloneResult.localPath
            );


        console.log("Python analysis completed");

        // ------------------------------------------------------------
        // Step 3: Save GitHub project and analysis to MongoDB
        // ------------------------------------------------------------
        
        const project = await Project.create({
            userId: req.user.userId,
        
            // Project came from GitHub
            sourceType: "github",
        
            // GitHub repository information
            githubUrl: cloneResult.githubUrl,
            githubOwner: cloneResult.owner,
            githubRepo: cloneResult.repoName,
        
            // ZIP-specific fields are not required for GitHub projects
            originalName: null,
            fileName: null,
            fileSize: 0,
        
            // Python returns the actual analysis inside data
            analysis: analysisResult.data,
        });
        
        console.log(
            "GitHub project saved to MongoDB:",
            project._id
        );
        // ------------------------------------------------------------
        // Step 4: Send result to client
        // ------------------------------------------------------------
        
        return res.status(200).json({
            success: true,
            message: "GitHub repository cloned, analyzed and saved successfully",
        
            data: {
                projectId: project._id,
                github: cloneResult,
                analysis: analysisResult.data,
            },
        });

    } catch (error) {

        console.error(
            "GitHub controller error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ============================================================================
// Export
// ============================================================================

module.exports = {
    cloneRepository,
};