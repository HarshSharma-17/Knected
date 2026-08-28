/**
 * ============================================================================
 * File: app.js
 * Path: Backend/src/app.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Creates and configures the Express application.
 *
 * Responsibilities:
 * - Create Express app
 * - Register middleware
 * - Register application routes
 * - Handle unknown routes
 * - Handle application errors
 * - Export configured app
 *
 * Author: Harsh Sharma
 * Project: Knected - AI Code Dependency Visualizer
 * ============================================================================
 */

const express = require("express");
const cors = require("cors");

const errorHandler = require("./middleware/errorHandler");
const uploadRoutes = require("./routes/uploadRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const app = express();

// ==============================
// Global Middleware
// ==============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
// ==============================
// Health Check Route
// ==============================

/**
 * GET /
 *
 * Used to verify that the backend server is running correctly.
 */
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Knected Backend 🚀",
    });
});

// ==============================
// API Routes
// ==============================

app.use("/api/upload", uploadRoutes);
app.use("/api/analysis", analysisRoutes);

// ==============================
// Unknown Route Handler
// ==============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found.",
    });
});

// ==============================
// Global Error Handler
// ==============================

app.use(errorHandler);

module.exports = app;