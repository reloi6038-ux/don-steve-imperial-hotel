const mongoose = require("mongoose");
require("dotenv").config();

const Room = require("./models/Room");


const rooms = [

    {
        name: "Deluxe King Room",

        description:
            "A beautifully appointed king room combining elegant design, premium comfort and a peaceful atmosphere.",

        price: 120000,

        capacity: 2,

        image: "/images/deluxe-king-room.jpg"
    },


    {
        name: "Executive Suite",

        description:
            "A spacious executive suite with a refined bedroom, comfortable living area and premium amenities.",

        price: 200000,

        capacity: 3,

        image: "/images/executive-suite.jpg"
    },


    {
        name: "Presidential Suite",

        description:
            "Our signature suite offering generous living spaces, sophisticated interiors and an exceptional luxury experience.",

        price: 350000,

        capacity: 4,

        image: "/images/presidential-suite.jpg"
    }

];