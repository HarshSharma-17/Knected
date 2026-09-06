/**
 * Purpose:
 * Provides standardized API response helpers.
 *
 * Responsibilities:
 * - Send successful responses
 * - Send error responses
 */

// Send successful response
const sendSuccess = (
    res,
    message = "Request successful",
    data = null,
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

// Send error response
const sendError = (
    res,
    message = "Something went wrong",
    statusCode = 500,
    errors = null
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

module.exports = {
    sendSuccess,
    sendError,
};