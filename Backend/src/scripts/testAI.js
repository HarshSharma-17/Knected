/**
 * Test Knected AI service.
 */

require("dotenv").config();

const {
    generateAIResponse,
} = require("../services/aiService");


const runTest = async () => {

    try {

        const response =
            await generateAIResponse({

                systemPrompt:
                    "You are Knected AI. Answer briefly.",

                userPrompt:
                    "Explain what a dependency graph is in one sentence.",
            });


        console.log("\nAI RESPONSE:\n");

        console.log(response);

    } catch (error) {

        console.error(
            "\nAI TEST FAILED:\n"
        );

        console.error(
            error.message
        );
    }
};


runTest();