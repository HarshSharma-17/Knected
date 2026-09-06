/**
 * Purpose:
 * Tests User model connectivity with MongoDB.
 */

require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");

// Test user model
const testUser = async () => {
    try {
        await connectDB();

        const user = await User.create({
            name: "Knected Test User",
            email: "knectedtest@example.com",
            password: "test123",
        });

        console.log("✅ User created successfully:");
        console.log(user);

        process.exit(0);
    } catch (error) {
        console.error("❌ User test failed:", error.message);
        process.exit(1);
    }
};

testUser();