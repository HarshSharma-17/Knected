/**
 * Purpose:
 * Protect routes using JWT authentication.
 */

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("Authorization Header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No authentication token provided",
            });
        }

        const token = authHeader.substring(7);

        console.log("Token received:", token);

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from .env");

            return res.status(500).json({
                success: false,
                message: "JWT configuration missing",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("JWT decoded:", decoded);

        req.user = decoded;

        next();

    } catch (error) {
        console.error("JWT verification error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

module.exports = authMiddleware;