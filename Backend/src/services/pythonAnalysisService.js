/**
 * ============================================================================
 * File: pythonAnalysisService.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Connects the Node.js backend with the Python analysis engine.
 *
 * Responsibilities:
 * - Start the Python analysis process
 * - Pass the project path
 * - Receive the JSON result
 * - Return the analysis result to the controller
 * ============================================================================
 */

const { spawn } = require("child_process");
const path = require("path");

const analyzeProjectWithPython = (projectPath) => {
    return new Promise((resolve, reject) => {

        // Path to Python virtual environment
        const pythonPath = path.join(
            __dirname,
            "../../../Python/venv/bin/python"
        );

        // Path to Python main file
        const mainPath = path.join(
            __dirname,
            "../../../Python/main.py"
        );

        // Start Python process
        const pythonProcess = spawn(
            pythonPath,
            [mainPath, projectPath]
        );

        let output = "";
        let errorOutput = "";

        // Receive Python output
        pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        // Receive Python errors
        pythonProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        // Python process finished
        pythonProcess.on("close", (code) => {

            if (code !== 0) {
                return reject(
                    new Error(
                        errorOutput || "Python analysis failed."
                    )
                );
            }

            try {
                const result = JSON.parse(output);

                resolve(result);

            } catch (error) {
                reject(
                    new Error(
                        `Invalid Python response: ${error.message}`
                    )
                );
            }
        });

        // Python process could not start
        pythonProcess.on("error", (error) => {
            reject(error);
        });
    });
};

// Export the analysis function
module.exports = {
    analyzeProjectWithPython,
};