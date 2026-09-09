/**
 * ============================================================================
 * File: aiService.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Connects Knected with the Groq AI API.
 *
 * Responsibilities:
 * - Send prompts to Groq
 * - Generate project summaries
 * - Explain dependency relationships
 * - Generate architecture insights
 * - Answer questions about projects
 *
 * Important:
 * Knected can analyze large repositories containing hundreds or thousands
 * of files. We NEVER send the complete analysis to the AI.
 *
 * Instead, this service creates a small and meaningful AI context containing:
 * - Project statistics
 * - Folder/module structure
 * - Most connected files
 * - Most referenced files
 * - Important relationships
 *
 * This keeps Groq requests small and predictable.
 * ============================================================================
 */


const GROQ_API_URL =
    "https://api.groq.com/openai/v1/chat/completions";


const DEFAULT_MODEL =
    process.env.GROQ_MODEL || "openai/gpt-oss-20b";


/*
 * Keep AI responses reasonably small.
 *
 * This is especially important when using Groq's
 * organization token-per-minute limits.
 */
const MAX_COMPLETION_TOKENS = 1000;


/*
 * Network settings.
 */
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 30000;


/*
 * Maximum number of items that can enter the AI context.
 *
 * These limits are intentionally small so even very large
 * repositories produce a predictable request size.
 */
const MAX_IMPORTANT_FILES = 25;
const MAX_IMPORTANT_EDGES = 25;
const MAX_FOLDER_ENTRIES = 40;


/**
 * ============================================================================
 * Generate AI response
 * ============================================================================
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


    let lastError = null;


    for (
        let attempt = 1;
        attempt <= MAX_RETRIES;
        attempt++
    ) {

        let controller = null;
        let timeout = null;


        try {

            controller =
                new AbortController();


            timeout =
                setTimeout(
                    () => controller.abort(),
                    REQUEST_TIMEOUT
                );


            const response =
                await fetch(
                    GROQ_API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${process.env.GROQ_API_KEY}`,
                        },

                        body: JSON.stringify({

                            model:
                                DEFAULT_MODEL,

                            messages: [
                                {
                                    role: "system",
                                    content:
                                        systemPrompt,
                                },

                                {
                                    role: "user",
                                    content:
                                        userPrompt,
                                },
                            ],

                            /*
                             * Keep the answer concise.
                             */
                            temperature: 0.2,

                            /*
                             * Prevent very large responses.
                             */
                            max_completion_tokens:
                                MAX_COMPLETION_TOKENS,

                            /*
                             * GPT-OSS reasoning is useful,
                             * but low reasoning keeps token usage down.
                             */
                            reasoning_effort:
                                "low",
                        }),

                        signal:
                            controller.signal,
                    }
                );


            const data =
                await response.json();


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

        } catch (error) {

            lastError =
                error;


            const isTimeout =
                error?.name ===
                "AbortError";


            const isFetchError =
                error?.message ===
                "fetch failed";


            console.error(
                `[AI] Attempt ${attempt}/${MAX_RETRIES} failed:`,
                error.message
            );


            /*
             * Do not retry normal API errors.
             *
             * Examples:
             * - Invalid API key
             * - Request too large
             * - Invalid model
             * - Authentication error
             * - Rate/token limit errors
             */
            if (
                !isTimeout &&
                !isFetchError
            ) {

                throw error;
            }


            if (
                attempt <
                MAX_RETRIES
            ) {

                const delay =
                    attempt * 2000;


                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            delay
                        )
                );
            }

        } finally {

            if (timeout) {

                clearTimeout(
                    timeout
                );
            }
        }
    }


    throw new Error(
        lastError?.message ||
        "Unable to connect to Groq AI."
    );
};


/**
 * ============================================================================
 * Convert absolute file paths into short project-relative paths
 *
 * Example:
 *
 * /home/user/Documents/Knected/Backend/src/temp/Wind-123/Frontend/src/App.tsx
 *
 * becomes:
 *
 * Frontend/src/App.tsx
 * ============================================================================
 */
const compactPath = (value) => {

    if (!value) {
        return "";
    }


    let normalized =
        String(value)
            .replace(
                /\\/g,
                "/"
            );


    const tempMarker =
        "/temp/";


    const tempIndex =
        normalized.indexOf(
            tempMarker
        );


    if (tempIndex !== -1) {

        let relative =
            normalized.slice(
                tempIndex +
                tempMarker.length
            );


        const parts =
            relative.split("/");


        /*
         * Remove temporary project folder.
         */
        if (parts.length > 1) {

            relative =
                parts
                    .slice(1)
                    .join("/");
        }


        return relative;
    }


    /*
     * Fallback.
     *
     * If the path does not contain /temp/,
     * keep only the last few sections.
     */
    return normalized
        .split("/")
        .slice(-5)
        .join("/");
};


/**
 * ============================================================================
 * Get a clean project name
 * ============================================================================
 */
const getProjectName = (analysis) => {

    return (
        analysis?.project?.name ||
        analysis?.project?.originalName ||
        analysis?.project?.repo ||
        "Unknown Project"
    );
};


/**
 * ============================================================================
 * Create folder/module structure
 *
 * We do NOT send every file.
 *
 * Example output:
 *
 * [
 *   "Backend",
 *   "Backend/controllers",
 *   "Backend/routes",
 *   "Backend/services",
 *   "Frontend",
 *   "Frontend/components",
 *   "Frontend/pages"
 * ]
 * ============================================================================
 */
const createFolderStructure = (
    files
) => {

    const folders =
        new Set();


    for (
        const file of files
    ) {

        const path =
            compactPath(
                file.file
            );


        if (!path) {
            continue;
        }


        const parts =
            path.split("/");


        /*
         * Keep only the first 2-3 levels.
         *
         * This gives the AI an idea of the architecture
         * without sending every file path.
         */
        const maxDepth =
            Math.min(
                parts.length - 1,
                3
            );


        for (
            let depth = 1;
            depth <= maxDepth;
            depth++
        ) {

            folders.add(
                parts
                    .slice(0, depth)
                    .join("/")
            );
        }
    }


    return Array.from(folders)
        .sort()
        .slice(
            0,
            MAX_FOLDER_ENTRIES
        );
};


/**
 * ============================================================================
 * Create intelligent compact AI context
 *
 * This is the most important function in this file.
 *
 * A huge project might contain:
 *
 * 1000 files
 * 5000 dependencies
 * 2000 graph edges
 *
 * We DO NOT send all of them.
 *
 * Instead we calculate the most useful information first.
 * ============================================================================
 */
const createCompactProjectContext = (
    analysis
) => {

    const files =
        Array.isArray(
            analysis?.files
        )
            ? analysis.files
            : [];


    const nodes =
        Array.isArray(
            analysis?.graph?.nodes
        )
            ? analysis.graph.nodes
            : [];


    const edges =
        Array.isArray(
            analysis?.graph?.edges
        )
            ? analysis.graph.edges
            : [];


    /**
     * ------------------------------------------------------------------------
     * Basic statistics
     * ------------------------------------------------------------------------
     */

    const totalDependencies =
        files.reduce(
            (total, file) =>
                total +
                (
                    Array.isArray(
                        file.dependencies
                    )
                        ? file.dependencies.length
                        : 0
                ),
            0
        );


    /**
     * ------------------------------------------------------------------------
     * Build file dependency information
     * ------------------------------------------------------------------------
     */

    const fileStats =
        files.map(
            (file) => {

                const filePath =
                    compactPath(
                        file.file
                    );


                return {

                    file:
                        filePath,

                    dependencyCount:
                        Array.isArray(
                            file.dependencies
                        )
                            ? file.dependencies.length
                            : 0,

                };
            }
        )
        .filter(
            (file) =>
                file.file
        );


    /**
     * ------------------------------------------------------------------------
     * Count incoming references
     *
     * Example:
     *
     * server.js
     *    ↑
     * route1.js
     * route2.js
     * route3.js
     *
     * server.js has 3 incoming references.
     *
     * This helps us find important architectural hubs.
     * ------------------------------------------------------------------------
     */

    const incomingReferences =
        new Map();


    for (
        const edge of edges
    ) {

        const target =
            compactPath(
                edge.target
            );


        if (!target) {
            continue;
        }


        incomingReferences.set(
            target,
            (
                incomingReferences.get(
                    target
                ) || 0
            ) + 1
        );
    }


    /**
     * ------------------------------------------------------------------------
     * Add incoming reference count to file statistics
     * ------------------------------------------------------------------------
     */

    const enrichedFiles =
        fileStats.map(
            (file) => ({

                file:
                    file.file,

                dependencyCount:
                    file.dependencyCount,

                referencedBy:
                    incomingReferences.get(
                        file.file
                    ) || 0,

            })
        );


    /**
     * ------------------------------------------------------------------------
     * Find most dependency-heavy files
     * ------------------------------------------------------------------------
     */

    const mostDependentFiles =
        [...enrichedFiles]
            .sort(
                (a, b) =>
                    b.dependencyCount -
                    a.dependencyCount
            )
            .slice(
                0,
                12
            );


    /**
     * ------------------------------------------------------------------------
     * Find most referenced files
     * ------------------------------------------------------------------------
     */

    const mostReferencedFiles =
        [...enrichedFiles]
            .sort(
                (a, b) =>
                    b.referencedBy -
                    a.referencedBy
            )
            .slice(
                0,
                12
            );


    /**
     * ------------------------------------------------------------------------
     * Combine important files
     *
     * Some files may appear in both lists.
     * ------------------------------------------------------------------------
     */

    const importantFileMap =
        new Map();


    [
        ...mostDependentFiles,
        ...mostReferencedFiles,
    ]
        .forEach(
            (file) => {

                importantFileMap.set(
                    file.file,
                    file
                );
            }
        );


    const importantFiles =
        Array.from(
            importantFileMap.values()
        )
        .slice(
            0,
            MAX_IMPORTANT_FILES
        );


    /**
     * ------------------------------------------------------------------------
     * Select important graph relationships
     *
     * We prioritize edges connected to important files.
     * ------------------------------------------------------------------------
     */

    const importantFileNames =
        new Set(
            importantFiles.map(
                (file) =>
                    file.file
            )
        );


    const importantEdges =
        edges
            .map(
                (edge) => ({

                    source:
                        compactPath(
                            edge.source
                        ),

                    target:
                        compactPath(
                            edge.target
                        ),

                })
            )
            .filter(
                (edge) =>
                    edge.source &&
                    edge.target
            )
            .sort(
                (a, b) => {

                    const scoreA =
                        (
                            importantFileNames.has(
                                a.source
                            )
                                ? 1
                                : 0
                        ) +
                        (
                            importantFileNames.has(
                                a.target
                            )
                                ? 1
                                : 0
                        );


                    const scoreB =
                        (
                            importantFileNames.has(
                                b.source
                            )
                                ? 1
                                : 0
                        ) +
                        (
                            importantFileNames.has(
                                b.target
                            )
                                ? 1
                                : 0
                        );


                    return scoreB - scoreA;
                }
            )
            .slice(
                0,
                MAX_IMPORTANT_EDGES
            );


    /**
     * ------------------------------------------------------------------------
     * Folder structure
     * ------------------------------------------------------------------------
     */

    const folderStructure =
        createFolderStructure(
            files
        );


    /**
     * ------------------------------------------------------------------------
     * Return small AI context
     *
     * Notice that the complete files/dependencies/nodes/edges
     * are NOT returned here.
     * ------------------------------------------------------------------------
     */

    return {

        project: {

            name:
                getProjectName(
                    analysis
                ),

            sourceType:
                analysis?.project?.sourceType ||
                analysis?.sourceType ||
                "Unknown",

        },


        statistics: {

            totalFiles:
                files.length,

            totalDependencies:
                totalDependencies,

            totalNodes:
                nodes.length,

            totalEdges:
                edges.length,

        },


        folderStructure:
            folderStructure,


        importantFiles:
            importantFiles.map(
                (file) => ({

                    file:
                        file.file,

                    dependencies:
                        file.dependencyCount,

                    referencedBy:
                        file.referencedBy,

                })
            ),


        importantRelationships:
            importantEdges,

    };
};


/**
 * ============================================================================
 * Generate Project Summary
 * ============================================================================
 */
const generateProjectSummary = async (
    analysis
) => {

    /*
     * Create the small AI context.
     */
    const compactAnalysis =
        createCompactProjectContext(
            analysis
        );


    const systemPrompt = `
You are Knected AI.

Knected is an AI Code Dependency Visualizer.

Your job is to analyze a software project's
architecture using structured dependency information.

Rules:

- Use ONLY the information provided.
- Never invent files, technologies, dependencies, or functionality.
- Do not claim something exists if it is not shown.
- Keep the explanation simple and useful.
- Focus on architecture and dependency structure.
- Do not reproduce the complete file list.
- Avoid unnecessary technical jargon.
- Keep the final answer concise.
`;


    const userPrompt = `
Analyze this Knected project.

PROJECT DATA:

${JSON.stringify(
    compactAnalysis,
    null,
    2
)}

Give the following:

## 1. Project Overview

Briefly explain what the project structure appears
to represent.

## 2. Architecture

Explain the major folders/modules and how the
project is organized.

## 3. Important Files

Mention the most important or highly connected files
shown in the data and explain why they appear important.

## 4. Dependency Observations

Explain the most notable dependency patterns.

## 5. Recommendations

Give exactly 2 practical recommendations based
ONLY on the provided architecture data.

Keep the entire response concise.
Do not reproduce the raw JSON.
`;
    

    return generateAIResponse({

        systemPrompt,

        userPrompt,

    });
};


/**
 * ============================================================================
 * Generate Dependency Explanation
 * ============================================================================
 */
const generateDependencyExplanation = async ({
    source,
    target,
}) => {

    const systemPrompt = `
You are Knected AI.

Knected is an AI Code Dependency Visualizer.

Explain relationships between source-code files.

Rules:

- Use only the provided information.
- Do not invent code or functionality.
- Clearly explain which file depends on which file.
- Keep the explanation simple.
- Keep the answer concise.
`;


    const userPrompt = `
Explain this dependency:

Source:
${compactPath(source)}

Target:
${compactPath(target)}

The source file depends on the target file.

Explain:

1. What the relationship means
2. Why it may matter architecturally
3. What developers should understand about it

Keep the answer concise.
`;


    return generateAIResponse({

        systemPrompt,

        userPrompt,

    });
};


/**
 * ============================================================================
 * Generate Architecture Insights
 * ============================================================================
 */
const generateArchitectureInsights = async (
    architectureData
) => {

    /*
     * Architecture data should already be compact,
     * but we still limit the amount of information
     * sent to the model.
     */

    const safeArchitectureData = {

        statistics:
            architectureData?.statistics || {},

        mostConnectedFiles:
            Array.isArray(
                architectureData?.mostConnectedFiles
            )
                ? architectureData.mostConnectedFiles.slice(
                    0,
                    15
                )
                : [],

        relationships:
            Array.isArray(
                architectureData?.relationships
            )
                ? architectureData.relationships.slice(
                    0,
                    20
                )
                : [],

    };


    const systemPrompt = `
You are Knected AI.

Knected is an AI Code Dependency Visualizer.

Analyze software architecture using dependency
graph metrics.

Rules:

- Use only the provided data.
- Do not invent files or relationships.
- Do not call something a problem unless the data
  supports the observation.
- Clearly separate observations from recommendations.
- Use simple technical language.
- Keep the answer concise.
`;


    const userPrompt = `
Analyze this architecture data:

${JSON.stringify(
    safeArchitectureData,
    null,
    2
)}

Provide:

## 1. Architecture Overview

## 2. Most Connected Files

## 3. Important Observations

## 4. Areas Worth Reviewing

## 5. Recommendations

Give exactly 2 practical recommendations.
`;


    return generateAIResponse({

        systemPrompt,

        userPrompt,

    });
};


/**
 * ============================================================================
 * Ask Knected
 * ============================================================================
 */
const askKnected = async ({
    question,
    projectAnalysis,
}) => {

    /*
     * Use the same compact context.
     *
     * This prevents Ask Knected from becoming expensive
     * on large repositories.
     */
    const compactAnalysis =
        createCompactProjectContext(
            projectAnalysis
        );


    const systemPrompt = `
You are Knected AI.

Knected is an AI Code Dependency Visualizer.

Answer questions about a software project using
the provided architecture data.

Rules:

- Use ONLY the provided project information.
- Do not invent files, dependencies, technologies,
  or relationships.
- If the answer cannot be determined from the data,
  clearly say that the information is not available.
- Keep answers direct and concise.
- Do not reproduce large portions of the project data.
`;


    const userPrompt = `
PROJECT:

${JSON.stringify(
    compactAnalysis,
    null,
    2
)}

QUESTION:

${question}

Answer the question directly.

Use file names, dependency counts, folder structure,
and relationships when they help answer the question.
`;


    return generateAIResponse({

        systemPrompt,

        userPrompt,

    });
};


/**
 * ============================================================================
 * Exports
 * ============================================================================
 */
module.exports = {

    generateAIResponse,

    generateProjectSummary,

    generateDependencyExplanation,

    generateArchitectureInsights,

    askKnected,

};