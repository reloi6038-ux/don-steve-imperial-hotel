const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        name: {
            type: String,
            trim: true,
            default: "Hotel Administrator"
        },

        role: {
            type: String,
            default: "admin"
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Admin",
        adminSchema
    );