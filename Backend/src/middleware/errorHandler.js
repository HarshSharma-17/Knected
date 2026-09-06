/**
 * ============================================================================
 * File: errorHandler.js
 * Path: Backend/src/middleware/errorHandler.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Provides centralized error handling for the Knected backend.
 *
 * Responsibilities:
 * - Catch application errors
 * - Log errors
 * - Prevent duplicate error-handling logic
 * - Return standardized error responses
 *
 * Note:
 * This middleware must be registered AFTER all application routes.
 *
 * Author: Harsh Sharma
 * Project: Knected - AI Code Dependency Visualizer
 * ============================================================================
 */

const { sendError } = require("../utils/response");
const logger = require("../utils/logger");

/**
 * Handle errors generated anywhere in the Express application.
 *
 * @param {Error} err - Error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object} Standardized error response.
 */
const errorHandler = (err, req, res, next) => {
    logger.error("Unhandled application error", err);

    const statusCode = err.statusCode || 500;

    return sendError(
        res,
        err.message || "Internal server error",
        statusCode
    );
};

module.exports = errorHandler;