const express = require("express");

const Room = require("../models/Room");

const router = express.Router();


// Get all rooms
router.get("/", async (req, res) => {

    try {

        const rooms = await Room.find()
            .sort({ price: 1 });

        res.json({
            success: true,
            rooms: rooms
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve rooms"
        });

    }

});


module.exports = router;