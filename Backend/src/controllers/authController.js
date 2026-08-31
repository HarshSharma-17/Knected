/**
 * purpose - handles usr authentication
 * 
 * 
 * responsibilites - register new users
 *                 - validate registration data 
 *                 - hash passwords before saving
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const register = async (req, res) => {
    try{
        const { name, email, password} = req.body;

        //validate input
        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            })
        }

        //check if user already exists
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Create user
const user = await User.create({
    name,
    email,
    password: hashedPassword,
});

        //dont send password in response
        return res.status(201).json({
            success: true,
            message: "User registerd successfully",
            data:{
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error){
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};
// Google Login
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        // Check whether Google ID token was received
        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: "Google ID token is required"
            });
        }

        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const {
            sub: googleId,
            email,
            name,
            picture
        } = payload;

        // Check whether user already exists
        let user = await User.findOne({ email });

        // If user doesn't exist, create a new user
        if (!user) {
            user = await User.create({
                name: name || "Google User",
                email: email,
                googleId: googleId,
                password: null
            });
        } else {
            // If user exists but googleId is missing,
            // connect the Google account
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        }

        // Create our own Knected JWT
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    picture: picture || null
                }
            }
        });

    } catch (error) {
        console.error("Google login error:", error);

        return res.status(401).json({
            success: false,
            message: "Google authentication failed"
        });
    }
};
module.exports = {
    register,
    login,
    googleLogin,
};

