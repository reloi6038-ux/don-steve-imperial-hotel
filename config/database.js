const mongoose = require("mongoose");

async function connectDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from your .env file");
        }

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);

        console.log("\nCheck the following:");
        console.log("1. MONGODB_URI in .env");
        console.log("2. MongoDB Atlas Network Access");
        console.log("3. MongoDB username and password");
        console.log("4. Your Atlas cluster is running");

        throw error;
    }
}

module.exports = connectDB;