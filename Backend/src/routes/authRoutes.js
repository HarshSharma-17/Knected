/**
 * ============================================================================
 * File: authRoutes.js
 * Path: Backend/src/routes/authRoutes.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Defines authentication routes for:
 * - User registration
 * - Email/password login
 * - Google login
 * - Fetching the complete logged-in user profile
 * ============================================================================
 */

const express = require("express");

const {
    register,
    login,
    googleLogin,
} = require("../controllers/authController");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================================
// Register User
// ============================================================================
router.post("/register", register);


// ============================================================================
// Login with Email and Password
// ============================================================================
router.post("/login", login);


// ============================================================================
// Login with Google
// ============================================================================
router.post("/google", googleLogin);


// ============================================================================
// Get Currently Logged-in User
// ============================================================================
// The JWT contains userId and email, but not the complete user information.
// Therefore, we fetch the actual user document from MongoDB.
//
// This allows the Profile page to receive:
// - Name
// - Email
// - Account creation date
//
// Password is explicitly excluded.
// ============================================================================
router.get("/me", authMiddleware, async (req, res) => {

    try {

        const user = await User
            .findById(req.user.userId)
            .select("-password");


        // User does not exist
        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found.",
            });

        }


        // Send user profile information
        return res.status(200).json({

            success: true,

            message: "Authenticated successfully",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                createdAt: user.createdAt,

            },

        });

    } catch (error) {

        console.error("Get current user error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to load user profile.",

        });

    }

});


module.exports = router;