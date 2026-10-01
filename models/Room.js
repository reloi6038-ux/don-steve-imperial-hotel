const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        capacity: {
            type: Number,
            required: true
        },

        image: {
            type: String,
            required: true
        }
    },

    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "Room",
    roomSchema
);