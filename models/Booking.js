const mongoose = require("mongoose");


const bookingSchema =
    new mongoose.Schema(

        {

            guestName: {

                type: String,

                required: true,

                trim: true

            },


            name: {

                type: String,

                trim: true

            },


            email: {

                type: String,

                required: true,

                trim: true,

                lowercase: true

            },


            phone: {

                type: String,

                required: true,

                trim: true

            },


            country: {

                type: String,

                trim: true

            },


            room: {

                type: String,

                required: true,

                trim: true

            },


            roomType: {

                type: String,

                trim: true

            },


            checkIn: {

                type: Date,

                required: true

            },


            checkOut: {

                type: Date,

                required: true

            },


            guests: {

                type: Number,

                required: true,

                min: 1

            },


            specialRequests: {

                type: String,

                trim: true

            },


            requests: {

                type: String,

                trim: true

            },


            status: {

                type: String,

                enum: [

                    "pending",

                    "confirmed",

                    "cancelled"

                ],

                default: "pending"

            }

        },

        {

            timestamps: true

        }

    );


module.exports =
    mongoose.model(
        "Booking",
        bookingSchema
    );