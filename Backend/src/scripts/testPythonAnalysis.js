/*purpose - test comm between the nodes.js backend and python analyzer

responsibilites: 
        - provide a test project path
        - call the python analysis service
        - display the returned result
*/

//python analysis service
const {
    analyzeProjectWithPython,
} = require("../services/pythonAnalysisService");

const projectPath =
    "src/temp/knected-test-project-1787619560789/knected-test-project";

// Test Python analysis
const runTest = async () => {
    try {
        const result = await analyzeProjectWithPython(projectPath);

        console.log("Python analysis result:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Python analysis failed:");
        console.error(error.message);
    }
};

runTest();