/**
 * Purpose:
 * Handles project analysis API requests.
 *
 * Responsibilities:
 * - Receive the extracted project path
 * - Start Python project analysis
 * - Return analysis results to the client
 */

const { sendSuccess, sendError} = require("../utils/response");

//python analysis service
const{
    analyzeProjectWithPython,
} = require("../services/pythonAnalysisService");

//Analyze uploaded project
const analyzeProject = async(req, res) => {
    try{
        const { projectPath } = req.body;

        //validate project path
        if(!projectPath){
            return sendError(
                res,"Project path is required.",
                400
            );
        }

        // Run Python analysis
        const result = await analyzeProjectWithPython(projectPath);

        // Handle Python analysis failure
        if (!result.success) {
            return sendError(
                res,
                result.error || "Project analysis failed.",
                500
            );
        }

        return sendSuccess(
            res,
            "Project analyzed successfully.",
            result.data,
            200
        );
    } catch (error) {
        return sendError(
            res,
            error.message,
            500
        );
    }
};

module.exports = { 
    analyzeProject,
};