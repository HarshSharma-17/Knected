/**
 * ============================================================================
 * File: aiService.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Connects Knected with the Groq AI API.
 *
 * Responsibilities:
 * - Send prompts to the AI model
 * - Generate project analysis responses
 * - Keep AI/API logic separate from controllers and routes
 * ============================================================================
 */

const GROQ_API_URL =
    "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_MODEL =
    process.env.GROQ_MODEL || "openai/gpt-oss-20b";


/**
 * Send a request to Groq.
 */
const generateAIResponse = async ({
    systemPrompt,
    userPrompt,
}) => {

    if (!process.env.GROQ_API_KEY) {
        throw new Error(
            "GROQ_API_KEY is not configured."
        );
    }

    const response = await fetch(
        GROQ_API_URL,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${process.env.GROQ_API_KEY}`,
            },

            body: JSON.stringify({
                model: DEFAULT_MODEL,

                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],

                temperature: 0.2,
            }),
        }
    );


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data?.error?.message ||
            "AI request failed."
        );
    }


    const content =
        data?.choices?.[0]?.message?.content;


    if (!content) {
        throw new Error(
            "AI returned an empty response."
        );
    }


    return content;
};


/**
 * Generate a project summary.
 */
const generateProjectSummary = async (
    analysis
) => {

    const systemPrompt = `
You are Knected AI.

Knected is an AI Code Dependency Visualizer.

Your job is to analyze structured project-analysis
data and explain the architecture clearly.

Rules:
- Use only the information provided.
- Do not invent files, technologies or dependencies.
- Explain technical concepts in simple language.
- Focus on architecture and dependency relationships.
- Keep the response concise but useful.
`;


    const userPrompt = `
Analyze the following Knected project.

PROJECT ANALYSIS:

${JSON.stringify(
    analysis,
    null,
    2
)}

Provide:

1. Project overview
2. Main architectural structure
3. Important files
4. Dependency observations
5. One or two useful recommendations

Format the answer with clear headings.
`;


    return generateAIResponse({
        systemPrompt,
        userPrompt,
    });
};

/**
 * Generate an explanation for a dependency relationship.
 */
const generateDependencyExplanation = async ({
    source,
    target,
}) => {

    const systemPrompt = `
You are Knected AI.

Knected is an AI Code Dependency Visualizer.

Your job is to explain relationships between source-code files.

Rules:
- Use only the provided information.
- Do not invent code or functionality.
- Explain the dependency in simple technical language.
- Clearly explain which file depends on which file.
- Keep the response concise and useful.
`;


    const userPrompt = `
Explain the following dependency relationship:

Source file:
${source}

Target file:
${target}

The source file depends on the target file.

Provide:

1. Dependency explanation
2. Why this relationship matters
3. Architectural impact

Keep the explanation concise.
`;


    return generateAIResponse({
        systemPrompt,
        userPrompt,
    });
};

/**
 * Generate AI insights from project architecture metrics.
 */
const generateArchitectureInsights = async (architectureData) => {

    const systemPrompt = `
You are Knected AI.

Knected is an AI Code Dependency Visualizer.

Your job is to explain software architecture using
dependency graph metrics calculated by Knected.

Rules:
- Use only the provided data.
- Do not invent files, dependencies, technologies, or relationships.
- Do not claim that a file is problematic unless the provided
  metrics support that observation.
- Explain technical concepts in simple language.
- Focus on architectural structure, highly connected files,
  dependency concentration, and possible areas that deserve attention.
- Clearly distinguish observations from recommendations.
- Keep the response concise but useful.
`;


    const userPrompt = `
Analyze the following architecture information
calculated from a Knected dependency graph.

ARCHITECTURE DATA:

${JSON.stringify(
    architectureData,
    null,
    2
)}

Provide:

1. Architecture overview
2. Most connected files
3. Important architectural observations
4. Potential hotspots or areas to review
5. Two practical recommendations

Use clear headings and simple technical language.
`;


    return generateAIResponse({
        systemPrompt,
        userPrompt,
    });
};

/**
 * Answer a question about a Knected project.
 *
 * The project analysis can become very large, so we create
 * a compact AI context instead of sending the entire analysis.
 */
/**
 * ============================================================================
 * Answer a question about a Knected project.
 *
 * Creates a very small AI context so large repositories do not exceed
 * the model token limit.
 * ============================================================================
 */

const askKnected = async ({
    question,
    projectAnalysis,
}) => {

    const files =
        projectAnalysis?.files || [];

    const nodes =
        projectAnalysis?.graph?.nodes || [];

    const edges =
        projectAnalysis?.graph?.edges || [];


    // ------------------------------------------------------------
    // Create a map of node IDs to file names
    // ------------------------------------------------------------

    const nodeNameMap = {};

    nodes.forEach((node) => {

        nodeNameMap[node.id] =
            node.name || node.id;

    });


    // ------------------------------------------------------------
    // Compact file information
    // ------------------------------------------------------------

    const compactFiles =
        files
            .slice(0, 50)
            .map((file) => ({
                file: file.file
                    ? file.file.split("/").pop()
                    : "unknown",

                dependencyCount:
                    file.dependencies?.length || 0,
            }));


    // ------------------------------------------------------------
    // Compact graph information
    // ------------------------------------------------------------

    const compactEdges =
        edges
            .slice(0, 75)
            .map((edge) => ({

                source:
                    nodeNameMap[edge.source] ||
                    edge.source.split("/").pop(),

                target:
                    nodeNameMap[edge.target] ||
                    edge.target.split("/").pop(),

            }));


    // ------------------------------------------------------------
    // System prompt
    // ------------------------------------------------------------

    const systemPrompt = `
You are Knected AI.

Knected is an AI Code Dependency Visualizer.

Answer questions about a software project using
the provided project information.

Rules:
- Use only the provided information.
- Do not invent files, dependencies, or functionality.
- If the answer cannot be determined, say so.
- Keep the answer concise and clear.
- Prefer specific file names when available.
- Explain technical concepts simply.
`;


    // ------------------------------------------------------------
    // Small project context
    // ------------------------------------------------------------

    const context = {

        project: {
            name:
                projectAnalysis.project?.name ||
                "Unnamed project",

            sourceType:
                projectAnalysis.project?.sourceType ||
                "unknown",
        },

        statistics: {
            files: files.length,
            nodes: nodes.length,
            dependencies: edges.length,
        },

        files: compactFiles,

        relationships: compactEdges,
    };


    const userPrompt = `
PROJECT CONTEXT:

${JSON.stringify(
    context,
    null,
    2
)}

QUESTION:

${question}

Answer the question directly.
`;


    return generateAIResponse({
        systemPrompt,
        userPrompt,
    });
};

module.exports = {
    generateAIResponse,
    generateProjectSummary,
    generateDependencyExplanation,
    generateArchitectureInsights,
    askKnected,
};