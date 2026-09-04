/*
=========================================================
uploadService.js
Backend/src/services/uploadService.js

Purpose:
- Handle uploaded ZIP project files
- Extract the ZIP
- Analyze the extracted project using Python
- Return analysis data to the controller

The controller is responsible for the HTTP response.
This service is responsible for the actual upload workflow.
=========================================================
*/

const fs = require("fs");
const path = require("path");

const { extractZip } = require("./zipService");
const { analyzeProject } = require("./pythonAnalysisService");


/*
=========================================================
Process uploaded ZIP project
=========================================================
*/
const processUploadedProject = async (file) => {
    if (!file) {
        throw new Error("ZIP file is required");
    }

    console.log("ZIP upload received");
    console.log("Uploaded file:", file.path);

    // -----------------------------------------------------
    // 1. Create extraction directory
    // -----------------------------------------------------
    const extractDirectory = path.join(
        __dirname,
        "../temp",
        `project-${Date.now()}`
    );

    fs.mkdirSync(extractDirectory, {
        recursive: true,
    });

    console.log("Extraction path:", extractDirectory);


    // -----------------------------------------------------
    // 2. Extract ZIP file
    // -----------------------------------------------------
    await extractZip(
        file.path,
        extractDirectory
    );

    console.log("ZIP extracted successfully");


    // -----------------------------------------------------
    // 3. Analyze extracted project using Python
    // -----------------------------------------------------
    console.log("Starting Python analysis...");

    const analysis = await analyzeProject(
        extractDirectory
    );

    console.log("Python analysis completed");


    // -----------------------------------------------------
    // 4. Remove uploaded ZIP after processing
    // -----------------------------------------------------
    try {
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log("Temporary ZIP removed");
        }
    } catch (error) {
        console.log(
            "Warning: Could not remove temporary ZIP:",
            error.message
        );
    }


    // -----------------------------------------------------
    // 5. Return result
    // -----------------------------------------------------
    return {
        success: true,
        localPath: extractDirectory,
        analysis,
    };
};


/*
=========================================================
Export
=========================================================
*/

module.exports = {
    processUploadedProject,
};