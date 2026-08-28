/**
 * ============================================================================
 * File: server.js
 * Path: Backend/server.js
 * ----------------------------------------------------------------------------
 * Purpose:
 * Entry point of the Knected backend application.
 *
 * Responsibilities:
 * - Load environment variables
 * - Import the Express application
 * - Start the HTTP server
 *
 * Note:
 * This file should NEVER contain application logic, routes,
 * middleware, or business logic.
 *
 * Author: Harsh Sharma
 * Project: Knected - AI Code Dependency Visualizer
 * ============================================================================
 */

// ==============================
// Load Environment Variables
// ==============================

require("dotenv").config();

// ==============================
// Import Express Application
// ==============================

const app = require("./src/app");
const connectDB = require("./src/config/db");
// ==============================
// Define Server Port
// ==============================

const PORT = process.env.PORT || 5000;

// ==============================
// Start Server
// ==============================
connectDB();
app.listen(PORT, () => {
    console.log(`
===========================================
🚀 Knected Backend Started Successfully
-------------------------------------------
Server : http://localhost:${PORT}
Environment : ${process.env.NODE_ENV || "development"}
===========================================
`);
});