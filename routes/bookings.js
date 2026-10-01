const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN AUTHENTICATION
|--------------------------------------------------------------------------
|
| Your admin login should create:
|
| req.session.admin
|
| This can be true or an object such as:
|
| req.session.admin = {
|     username: "admin"
| };
|
|--------------------------------------------------------------------------
*/

function requireAdmin(req, res, next) {

    if (
        req.session &&
        req.session.admin
    ) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Administrator authentication required."
    });
}


/*
|--------------------------------------------------------------------------
| HELPER: VALIDATE MONGODB ID
|--------------------------------------------------------------------------
*/

function validObjectId(id) {

    return mongoose.Types.ObjectId.isValid(id);

}


/*
|--------------------------------------------------------------------------
| PUBLIC - CREATE RESERVATION
|--------------------------------------------------------------------------
|
| POST
| /api/bookings
|
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {

    try {

        const {
            guestName,
            name,
            email,
            phone,
            country,
            checkIn,
            checkOut,
            guests,
            room,
            roomType,
            specialRequests,
            requests
        } = req.body;


        /*
        |--------------------------------------------------------------------------
        | NORMALIZE GUEST NAME
        |--------------------------------------------------------------------------
        */

        const finalGuestName =
            String(
                guestName ||
                name ||
                ""
            ).trim();


        /*
        |--------------------------------------------------------------------------
        | NORMALIZE ROOM
        |--------------------------------------------------------------------------
        */

        const finalRoom =
            String(
                room ||
                roomType ||
                ""
            ).trim();


        /*
        |--------------------------------------------------------------------------
        | NORMALIZE SPECIAL REQUESTS
        |--------------------------------------------------------------------------
        */

        const finalRequests =
            String(
                specialRequests ||
                requests ||
                ""
            ).trim();


        /*
        |--------------------------------------------------------------------------
        | BASIC VALIDATION
        |--------------------------------------------------------------------------
        */

        if (!finalGuestName) {

            return res.status(400).json({
                success: false,
                message: "Guest name is required."
            });

        }


        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email address is required."
            });

        }


        if (!phone) {

            return res.status(400).json({
                success: false,
                message: "Phone number is required."
            });

        }


        if (!checkIn) {

            return res.status(400).json({
                success: false,
                message: "Check-in date is required."
            });

        }


        if (!checkOut) {

            return res.status(400).json({
                success: false,
                message: "Check-out date is required."
            });

        }


        if (!finalRoom) {

            return res.status(400).json({
                success: false,
                message: "Please select a room or suite."
            });

        }


        /*
        |--------------------------------------------------------------------------
        | EMAIL
        |--------------------------------------------------------------------------
        */

        const finalEmail =
            String(
                email
            )
                .trim()
                .toLowerCase();


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                finalEmail
            )
        ) {

            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });

        }


        /*
        |--------------------------------------------------------------------------
        | DATES
        |--------------------------------------------------------------------------
        */

        const arrival =
            new Date(
                checkIn
            );


        const departure =
            new Date(
                checkOut
            );


        if (
            Number.isNaN(
                arrival.getTime()
            ) ||
            Number.isNaN(
                departure.getTime()
            )
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid reservation dates."
            });

        }


        if (
            departure <= arrival
        ) {

            return res.status(400).json({
                success: false,
                message: "Check-out must be after check-in."
            });

        }


        /*
        |--------------------------------------------------------------------------
        | GUEST COUNT
        |--------------------------------------------------------------------------
        */

        const guestCount =
            Number(
                guests || 1
            );


        if (
            !Number.isInteger(
                guestCount
            ) ||
            guestCount < 1 ||
            guestCount > 20
        ) {

            return res.status(400).json({
                success: false,
                message: "Guest count must be between 1 and 20."
            });

        }


        /*
        |--------------------------------------------------------------------------
        | CREATE BOOKING
        |--------------------------------------------------------------------------
        |
        | We store both the newer field names and the older aliases.
        | This makes the dashboard compatible with your existing project.
        |
        |--------------------------------------------------------------------------
        */

        const booking =
            new Booking({

                guestName:
                    finalGuestName,

                name:
                    finalGuestName,

                email:
                    finalEmail,

                phone:
                    String(
                        phone
                    ).trim(),

                country:
                    String(
                        country ||
                        ""
                    ).trim(),

                checkIn:
                    arrival,

                checkOut:
                    departure,

                guests:
                    guestCount,

                room:
                    finalRoom,

                roomType:
                    finalRoom,

                specialRequests:
                    finalRequests,

                requests:
                    finalRequests,

                status:
                    "pending"

            });


        /*
        |--------------------------------------------------------------------------
        | SAVE TO MONGODB
        |--------------------------------------------------------------------------
        */

        await booking.save();


        console.log(
            "New reservation created:",
            booking._id
        );


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(201).json({

            success: true,

            message:
                "Reservation request received successfully.",

            booking: {

                id:
                    booking._id,

                guestName:
                    booking.guestName,

                email:
                    booking.email,

                room:
                    booking.room,

                checkIn:
                    booking.checkIn,

                checkOut:
                    booking.checkOut,

                guests:
                    booking.guests,

                status:
                    booking.status

            }

        });


    } catch (error) {

        console.error(
            "Create booking error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create reservation.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined

        });

    }

});


/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL RESERVATIONS
|--------------------------------------------------------------------------
|
| GET
| /api/bookings/admin
|
|--------------------------------------------------------------------------
*/

router.get(
    "/admin",
    requireAdmin,
    async (req, res) => {

        try {

            const bookings =
                await Booking.find({})
                    .sort({
                        createdAt: -1
                    })
                    .lean();


            console.log(
                `Admin requested reservations: ${bookings.length}`
            );


            return res.json({

                success: true,

                count:
                    bookings.length,

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
| ADMIN - GET RESERVATION STATISTICS
|--------------------------------------------------------------------------
|
| GET
| /api/bookings/admin/stats
|
| This route MUST appear before /admin/:id.
|
|--------------------------------------------------------------------------
*/

router.get(
    "/admin/stats",
    requireAdmin,
    async (req, res) => {

        try {

            const total =
                await Booking.countDocuments();


            const pending =
                await Booking.countDocuments({
                    status: "pending"
                });


            const confirmed =
                await Booking.countDocuments({
                    status: "confirmed"
                });


            const cancelled =
                await Booking.countDocuments({
                    status: "cancelled"
                });


            return res.json({

                success: true,

                statistics: {

                    total,

                    pending,

                    confirmed,

                    cancelled

                }

            });


        } catch (error) {

            console.error(
                "Booking statistics error:",
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
| ADMIN - GET ONE RESERVATION
|--------------------------------------------------------------------------
|
| GET
| /api/bookings/admin/:id
|
|--------------------------------------------------------------------------
*/

router.get(
    "/admin/:id",
    requireAdmin,
    async (req, res) => {

        try {

            if (
                !validObjectId(
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
                ).lean();


            if (!booking) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Reservation not found."

                });

            }


            return res.json({

                success: true,

                booking

            });


        } catch (error) {

            console.error(
                "Get single booking error:",
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
| ADMIN - UPDATE RESERVATION STATUS
|--------------------------------------------------------------------------
|
| PATCH
| /api/bookings/admin/:id
|
|--------------------------------------------------------------------------
*/

router.patch(
    "/admin/:id",
    requireAdmin,
    async (req, res) => {

        try {

            if (
                !validObjectId(
                    req.params.id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid reservation ID."

                });

            }


            const status =
                String(
                    req.body.status ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const allowedStatuses = [

                "pending",

                "confirmed",

                "cancelled"

            ];


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


            console.log(
                `Reservation ${booking._id} changed to ${status}`
            );


            return res.json({

                success: true,

                message:
                    "Reservation status updated.",

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
| ADMIN - DELETE RESERVATION
|--------------------------------------------------------------------------
|
| DELETE
| /api/bookings/admin/:id
|
|--------------------------------------------------------------------------
*/

router.delete(
    "/admin/:id",
    requireAdmin,
    async (req, res) => {

        try {

            if (
                !validObjectId(
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


            console.log(
                `Reservation deleted: ${booking._id}`
            );


            return res.json({

                success: true,

                message:
                    "Reservation deleted successfully."

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


module.exports = router;