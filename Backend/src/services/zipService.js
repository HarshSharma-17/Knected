//purpose : handles ZIP extraction for uploaded projects
//reponsible : extract ZIP files, 
       // return extracted project path, create unique project directory

const path = require("path");
const fs = require("fs");
const AdmZip = require("adm-zip");

//extract project zip

const extractProject = (zipPath, projectName) => {
    const safeName = projectName.replace(/[^a-zA-Z0-9-_]/g, "_");

    const extractionPath = path.join(
        __dirname,
        "../temp",
        `${safeName}-${Date.now()}`
    );
    //create extraction directory
    fs.mkdirSync(extractionPath, {recursive: true});

    const zip = new AdmZip(zipPath);

    //extract zip contents

    zip.extractAllTo(extractionPath, true);
    return extractionPath;

};

module.exports = {
    extractProject,
};