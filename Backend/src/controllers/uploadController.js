/**
 * ============================================================================
 * File: uploadController.js
 * Path: Backend/src/controllers/uploadController.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Handles project upload requests.
 *
 * Responsibilities:
 * - Validate uploaded ZIP files
 * - Extract the project
 * - Run Python analysis
 * - Return upload and analysis results
 * ============================================================================
 */

const path = require("path");

const { sendSuccess, sendError } = require("../utils/response");
const { extractProject } = require("../services/zipService");

const {
    analyzeProjectWithPython,
} = require("../services/pythonAnalysisService");
const Project = require("../models/Project");

// ============================================================================
// Upload, extract and analyze project
// ============================================================================

const uploadProject = async (req, res) => {

    try {

        console.log("1. Upload request received");


        // --------------------------------------------------------------------
        // Validate uploaded file
        // --------------------------------------------------------------------

        if (!req.file) {

            console.log("ERROR: No file received");

            return sendError(
                res,
                "Please upload a ZIP file.",
                400
            );
        }


        console.log(
            "2. File received:",
            req.file.originalname
        );


        // --------------------------------------------------------------------
        // Get project name
        // --------------------------------------------------------------------

        const projectName = path.parse(
            req.file.originalname
        ).name;


        console.log(
            "3. Project name:",
            projectName
        );


        // --------------------------------------------------------------------
        // Extract project
        // --------------------------------------------------------------------

        console.log("4. Extracting project...");


        const extractedPath = extractProject(
            req.file.path,
            projectName
        );


        console.log(
            "5. Project extracted:",
            extractedPath
        );


        // --------------------------------------------------------------------
        // Convert extracted path to absolute path
        // --------------------------------------------------------------------

        const absoluteProjectPath = path.resolve(
            extractedPath
        );


        console.log(
            "6. Absolute project path:",
            absoluteProjectPath
        );


        // --------------------------------------------------------------------
        // Run Python analysis
        // --------------------------------------------------------------------

        console.log(
            "7. Starting Python analysis..."
        );


        const analysisResult =
            await analyzeProjectWithPython(
                absoluteProjectPath
            );


        console.log(
            "8. Python analysis completed"
        );

        console.log(
            "Analysis result:",
            analysisResult
        );


        // --------------------------------------------------------------------
        // Handle analysis failure
        // --------------------------------------------------------------------

        if (!analysisResult.success) {

            console.log(
                "ERROR: Python analysis failed"
            );

            return sendError(
                res,
                analysisResult.error ||
                    "Project analysis failed.",
                500
            );
        }

        // --------------------------------------------------------------------
        // Save project in MongoDB
        // --------------------------------------------------------------------
        
        console.log("9. Saving project to MongoDB...");
        
        const project = await Project.create({
            userId: req.user.userId,
        
            originalName: req.file.originalname,
            fileName: req.file.filename,
            fileSize: req.file.size,
        
            analysis: analysisResult.data,
        });
        
        console.log("10. Project saved:", project._id);


        // --------------------------------------------------------------------
        // Send final response
        // --------------------------------------------------------------------

        console.log(
            "11. Sending success response"
        );


        return sendSuccess(
            res,
            "Project uploaded and analyzed successfully.",
            {
                projectId: project._id,
                file: {
                    originalName: req.file.originalname,
                    fileName: req.file.filename,
                    size: req.file.size,
                },

                analysis: analysisResult.data,
            },
            201
        );


    } catch (error) {

        // --------------------------------------------------------------------
        // Handle unexpected errors
        // --------------------------------------------------------------------

        console.error(
            "UPLOAD ERROR:",
            error
        );


        return sendError(
            res,
            error.message ||
                "Project upload failed.",
            500
        );
    }
};


// ============================================================================
// Export
// ============================================================================

module.exports = {
    uploadProject,
};