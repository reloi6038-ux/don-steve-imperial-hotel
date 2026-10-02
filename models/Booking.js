"use strict";


const mongoose =
    require("mongoose");



const bookingSchema =
    new mongoose.Schema(

        {

            /*
            |--------------------------------------------------------------------------
            | GUEST INFORMATION
            |--------------------------------------------------------------------------
            */

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


            /*
            |--------------------------------------------------------------------------
            | ROOM INFORMATION
            |--------------------------------------------------------------------------
            */

            room: {

                type: String,

                required: true,

                trim: true

            },


            roomType: {

                type: String,

                trim: true

            },


            /*
            |--------------------------------------------------------------------------
            | STAY DATES
            |--------------------------------------------------------------------------
            */

            checkIn: {

                type: Date,

                required: true

            },


            checkOut: {

                type: Date,

                required: true

            },


            /*
            |--------------------------------------------------------------------------
            | GUEST COUNT
            |--------------------------------------------------------------------------
            */

            guests: {

                type: Number,

                required: true,

                min: 1,

                max: 20

            },


            /*
            |--------------------------------------------------------------------------
            | SPECIAL REQUESTS
            |--------------------------------------------------------------------------
            */

            specialRequests: {

                type: String,

                trim: true,

                default: ""

            },


            requests: {

                type: String,

                trim: true,

                default: ""

            },


            /*
            |--------------------------------------------------------------------------
            | RESERVATION STATUS
            |--------------------------------------------------------------------------
            */

            status: {

                type: String,

                enum: [

                    "pending",

                    "confirmed",

                    "cancelled"

                ],

                default:
                    "pending"

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