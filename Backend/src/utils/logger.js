/**
 * ============================================================================
 * File: logger.js
 * Path: Backend/src/utils/logger.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Provides a centralized logging utility for the Knected backend.
 *
 * Responsibilities:
 * - Log informational messages
 * - Log warnings
 * - Log errors
 * - Keep logging format consistent
 *
 * Author: Harsh Sharma
 * Project: Knected - AI Code Dependency Visualizer
 * ============================================================================
 */

/**
 * Log an informational message.
 *
 * @param {String} message - Message to display.
 * @param {*} data - Optional additional information.
 */
const info = (message, data = null) => {
    console.log(`[INFO] ${message}`, data || "");
};

/**
 * Log a warning message.
 *
 * @param {String} message - Warning message.
 * @param {*} data - Optional additional information.
 */
const warn = (message, data = null) => {
    console.warn(`[WARN] ${message}`, data || "");
};

/**
 * Log an error message.
 *
 * @param {String} message - Error message.
 * @param {*} error - Optional error object.
 */
const error = (message, error = null) => {
    console.error(`[ERROR] ${message}`, error || "");
};

module.exports = {
    info,
    warn,
    error,
};