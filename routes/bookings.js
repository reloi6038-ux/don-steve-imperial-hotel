"use strict";


const express =
    require("express");


const mongoose =
    require("mongoose");


const Booking =
    require("../models/Booking");


const { requireAdmin } =
    require("./admin");


const router =
    express.Router();



/*
|--------------------------------------------------------------------------
| PUBLIC - CREATE BOOKING
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    async (req, res) => {

        try {

            /*
            |--------------------------------------------------------------------------
            | NORMALIZE INPUT
            |--------------------------------------------------------------------------
            */

            const guestName =
                String(
                    req.body.guestName ||
                    req.body.name ||
                    ""
                ).trim();


            const email =
                String(
                    req.body.email ||
                    ""
                ).trim().toLowerCase();


            const phone =
                String(
                    req.body.phone ||
                    ""
                ).trim();


            const country =
                String(
                    req.body.country ||
                    ""
                ).trim();


            const room =
                String(
                    req.body.room ||
                    req.body.roomType ||
                    ""
                ).trim();


            const roomType =
                String(
                    req.body.roomType ||
                    req.body.room ||
                    ""
                ).trim();


            const checkIn =
                req.body.checkIn ||
                req.body.checkInDate;


            const checkOut =
                req.body.checkOut ||
                req.body.checkOutDate;


            const guests =
                Number(
                    req.body.guests ||
                    req.body.numberOfGuests ||
                    1
                );


            const specialRequests =
                String(
                    req.body.specialRequests ||
                    req.body.requests ||
                    ""
                ).trim();


            const requests =
                String(
                    req.body.requests ||
                    req.body.specialRequests ||
                    ""
                ).trim();



            /*
            |--------------------------------------------------------------------------
            | VALIDATION
            |--------------------------------------------------------------------------
            */

            if (!guestName) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Guest name is required."

                });

            }


            if (!email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email address is required."

                });

            }


            if (!phone) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Phone number is required."

                });

            }


            if (!room) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Room or suite selection is required."

                });

            }


            if (!checkIn) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Check-in date is required."

                });

            }


            if (!checkOut) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Check-out date is required."

                });

            }


            if (
                !Number.isInteger(guests) ||
                guests < 1 ||
                guests > 20
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Number of guests must be between 1 and 20."

                });

            }



            /*
            |--------------------------------------------------------------------------
            | DATE VALIDATION
            |--------------------------------------------------------------------------
            */

            const checkInDate =
                new Date(checkIn);


            const checkOutDate =
                new Date(checkOut);


            if (
                Number.isNaN(
                    checkInDate.getTime()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid check-in date."

                });

            }


            if (
                Number.isNaN(
                    checkOutDate.getTime()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid check-out date."

                });

            }


            if (
                checkOutDate <=
                checkInDate
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Check-out date must be after check-in date."

                });

            }



            /*
            |--------------------------------------------------------------------------
            | CREATE BOOKING
            |--------------------------------------------------------------------------
            */

            const booking =
                await Booking.create({

                    guestName,

                    name:
                        guestName,

                    email,

                    phone,

                    country,

                    room,

                    roomType,

                    checkIn:
                        checkInDate,

                    checkOut:
                        checkOutDate,

                    guests,

                    specialRequests,

                    requests,

                    status:
                        "pending"

                });



            /*
            |--------------------------------------------------------------------------
            | SUCCESS RESPONSE
            |--------------------------------------------------------------------------
            */

            return res.status(201).json({

                success: true,

                message:
                    "Reservation request submitted successfully.",

                booking,

                reservation:
                    booking

            });


        } catch (error) {

            console.error(
                "Create booking error:",
                error
            );


            /*
            |--------------------------------------------------------------------------
            | MONGOOSE VALIDATION ERROR
            |--------------------------------------------------------------------------
            */

            if (
                error.name ===
                "ValidationError"
            ) {

                const validationMessages =
                    Object.values(
                        error.errors
                    )
                    .map(
                        item =>
                            item.message
                    );


                return res.status(400).json({

                    success: false,

                    message:
                        validationMessages.join(" ")

                });

            }


            /*
            |--------------------------------------------------------------------------
            | GENERAL SERVER ERROR
            |--------------------------------------------------------------------------
            */

            return res.status(500).json({

                success: false,

                message:
                    "Unable to create reservation."

            });

        }

    }
);



/*
|--------------------------------------------------------------------------
| ADMIN - ALL BOOKINGS
|--------------------------------------------------------------------------
*/

router.get(
    "/admin",
    requireAdmin,
    async (req, res) => {

        try {

            const bookings =
                await Booking.find()
                    .sort({
                        createdAt: -1
                    })
                    .lean();


            return res.status(200).json({

                success: true,

                /*
                | Keep the original API name.
                */
                bookings,

                /*
                | Also provide reservations
                | for dashboard compatibility.
                */
                reservations:
                    bookings

            });


        } catch (error) {

            console.error(
                "Get admin bookings error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load reservations."

            });

        }

    }
);



/*
|--------------------------------------------------------------------------
| ADMIN - STATISTICS
|--------------------------------------------------------------------------
*/

router.get(
    "/admin/stats",
    requireAdmin,
    async (req, res) => {

        try {

            const [
                total,
                pending,
                confirmed,
                cancelled
            ] =
                await Promise.all([

                    Booking.countDocuments(),

                    Booking.countDocuments({
                        status: "pending"
                    }),

                    Booking.countDocuments({
                        status: "confirmed"
                    }),

                    Booking.countDocuments({
                        status: "cancelled"
                    })

                ]);


            return res.status(200).json({

                success: true,

                stats: {

                    total,

                    pending,

                    confirmed,

                    cancelled

                }

            });


        } catch (error) {

            console.error(
                "Booking stats error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load reservation statistics."

            });

        }

    }
);



/*
|--------------------------------------------------------------------------
| ADMIN - SINGLE BOOKING
|--------------------------------------------------------------------------
*/

router.get(
    "/admin/:id",
    requireAdmin,
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid reservation ID."

                });

            }


            const booking =
                await Booking.findById(
                    req.params.id
                );


            if (!booking) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Reservation not found."

                });

            }


            return res.status(200).json({

                success: true,

                booking,

                reservation:
                    booking

            });


        } catch (error) {

            console.error(
                "Get booking error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load reservation."

            });

        }

    }
);



/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE BOOKING
|--------------------------------------------------------------------------
*/

router.patch(
    "/admin/:id",
    requireAdmin,
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid reservation ID."

                });

            }


            const allowedStatuses = [

                "pending",

                "confirmed",

                "cancelled"

            ];


            const status =
                String(
                    req.body.status ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid reservation status."

                });

            }


            const booking =
                await Booking.findByIdAndUpdate(

                    req.params.id,

                    {
                        status
                    },

                    {
                        new: true,

                        runValidators: true

                    }

                );


            if (!booking) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Reservation not found."

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Reservation updated successfully.",

                booking,

                reservation:
                    booking

            });


        } catch (error) {

            console.error(
                "Update booking error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update reservation."

            });

        }

    }
);



/*
|--------------------------------------------------------------------------
| ADMIN - DELETE BOOKING
|--------------------------------------------------------------------------
*/

router.delete(
    "/admin/:id",
    requireAdmin,
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid reservation ID."

                });

            }


            const booking =
                await Booking.findByIdAndDelete(
                    req.params.id
                );


            if (!booking) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Reservation not found."

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Reservation deleted successfully.",

                booking,

                reservation:
                    booking

            });


        } catch (error) {

            console.error(
                "Delete booking error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete reservation."

            });

        }

    }
);



module.exports =
    router;