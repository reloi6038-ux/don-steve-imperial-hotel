const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const router = express.Router();


/*
|--------------------------------------------------------------------------
| ADMIN LOGIN
|--------------------------------------------------------------------------
*/

router.post(
    "/login",
    async (req, res) => {

        try {

            const {
                username,
                password
            } = req.body;


            const cleanUsername =
                String(
                    username || ""
                )
                    .trim()
                    .toLowerCase();


            const cleanPassword =
                String(
                    password || ""
                );


            if (
                !cleanUsername ||
                !cleanPassword
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Username and password are required."
                });

            }


            /*
            |--------------------------------------------------------------------------
            | FIND ADMIN
            |--------------------------------------------------------------------------
            */

            const admin =
                await Admin.findOne({
                    username:
                        cleanUsername
                });


            if (!admin) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid username or password."
                });

            }


            /*
            |--------------------------------------------------------------------------
            | CHECK ACTIVE STATUS
            |--------------------------------------------------------------------------
            */

            if (!admin.active) {

                return res.status(403).json({
                    success: false,
                    message:
                        "This administrator account is inactive."
                });

            }


            /*
            |--------------------------------------------------------------------------
            | CHECK PASSWORD
            |--------------------------------------------------------------------------
            */

            const passwordMatches =
                await bcrypt.compare(
                    cleanPassword,
                    admin.password
                );


            if (!passwordMatches) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid username or password."
                });

            }


            /*
            |--------------------------------------------------------------------------
            | CREATE ADMIN SESSION
            |--------------------------------------------------------------------------
            */

            req.session.admin = {
                id:
                    admin._id.toString(),

                username:
                    admin.username,

                name:
                    admin.name,

                role:
                    admin.role
            };


            /*
            |--------------------------------------------------------------------------
            | SAVE SESSION
            |--------------------------------------------------------------------------
            */

            req.session.save(
                error => {

                    if (error) {

                        console.error(
                            "Session save error:",
                            error
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Unable to create administrator session."
                        });

                    }


                    return res.json({
                        success: true,
                        message:
                            "Administrator login successful.",

                        admin: {
                            id:
                                admin._id,

                            username:
                                admin.username,

                            name:
                                admin.name,

                            role:
                                admin.role
                        }
                    });

                }
            );

        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to process administrator login."
            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| CHECK CURRENT ADMIN SESSION
|--------------------------------------------------------------------------
*/

router.get(
    "/me",
    (req, res) => {

        if (
            !req.session ||
            !req.session.admin
        ) {

            return res.status(401).json({
                success: false,
                authenticated: false,
                message:
                    "Administrator is not logged in."
            });

        }


        return res.json({
            success: true,
            authenticated: true,
            admin:
                req.session.admin
        });

    }
);


/*
|--------------------------------------------------------------------------
| ADMIN LOGOUT
|--------------------------------------------------------------------------
*/

router.post(
    "/logout",
    (req, res) => {

        if (!req.session) {

            return res.json({
                success: true,
                message:
                    "Administrator logged out."
            });

        }


        req.session.destroy(
            error => {

                if (error) {

                    console.error(
                        "Admin logout error:",
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Unable to log out."
                    });

                }


                res.clearCookie(
                    "hotel.sid"
                );


                return res.json({
                    success: true,
                    message:
                        "Administrator logged out successfully."
                });

            }
        );

    }
);


/*
|--------------------------------------------------------------------------
| ADMIN AUTHENTICATION MIDDLEWARE
|--------------------------------------------------------------------------
|
| Other protected admin routes can use this function.
|
|--------------------------------------------------------------------------
*/

function requireAdmin(
    req,
    res,
    next
) {

    if (
        req.session &&
        req.session.admin
    ) {

        return next();

    }


    return res.status(401).json({
        success: false,
        message:
            "Administrator authentication required."
    });

}


module.exports = {
    router,
    requireAdmin
};