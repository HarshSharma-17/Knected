/**
 * Purpose:
 * Defines authentication API routes for:
 * - User registration
 * - Normal email/password login
 * - Google login
 * - Getting the currently authenticated user
 */

const express = require("express");

const {
    register,
    login,
    googleLogin
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Register user
router.post("/register", register);

// Login with email and password
router.post("/login", login);

// Login with Google
router.post("/google", googleLogin);

// Get currently logged-in user
router.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authenticated successfully",
        user: req.user,
    });
});

module.exports = router;