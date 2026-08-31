/**
 * purpose define mongodb schema for knected users
 * 
 * responsibilites
 * store user account information
 * store password authentication data
 * store google authentication id
 */

const mongoose = require("mongoose");

//user schema 
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password:{
            type: String,
            default: null,
        },

        googleId:{
            type: String,
            default: null,
        },

    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("User", userSchema);