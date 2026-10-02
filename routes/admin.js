"use strict";

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");

const router = express.Router();

const JWT_EXPIRES_IN =
    process.env.JWT_EXPIRES_IN || "8h";


/*
|--------------------------------------------------------------------------
| JWT SECRET
|--------------------------------------------------------------------------
*/

function getJwtSecret() {

    if (!process.env.JWT_SECRET) {

        throw new Error(
            "JWT_SECRET is not configured in the .env file."
        );

    }

    return process.env.JWT_SECRET;
}


/*
|--------------------------------------------------------------------------
| GET BEARER TOKEN
|--------------------------------------------------------------------------
*/

function getTokenFromRequest(req) {

    const authorization =
        req.headers.authorization;

    if (
        !authorization ||
        typeof authorization !== "string"
    ) {
        return null;
    }

    if (
        !authorization
            .toLowerCase()
            .startsWith("bearer ")
    ) {
        return null;
    }

    const token =
        authorization
            .slice(7)
            .trim();

    return token || null;
}


/*
|--------------------------------------------------------------------------
| REQUIRE ADMIN
|--------------------------------------------------------------------------
*/

function requireAdmin(req, res, next) {

    const token =
        getTokenFromRequest(req);

    if (!token) {

        return res.status(401).json({

            success: false,

            message:
                "Administrator authentication is required."

        });

    }

    try {

        const decoded =
            jwt.verify(
                token,
                getJwtSecret()
            );

        if (
            !decoded ||
            decoded.type !== "admin" ||
            !decoded.sub
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid administrator token."

            });

        }

        req.admin = {

            id:
                decoded.sub,

            username:
                decoded.username,

            name:
                decoded.name,

            role:
                decoded.role

        };

        next();

    } catch (error) {

        console.error(
            "JWT verification error:",
            error.message
        );

        if (
            error.name ===
            "TokenExpiredError"
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Administrator token has expired."

            });

        }

        return res.status(401).json({

            success: false,

            message:
                "Invalid administrator token."

        });

    }
}


/*
|--------------------------------------------------------------------------
| ADMIN LOGIN
|--------------------------------------------------------------------------
*/

router.post(
    "/login",
    async (req, res) => {

        try {

            const username =
                String(
                    req.body.username || ""
                )
                    .trim()
                    .toLowerCase();

            const password =
                String(
                    req.body.password || ""
                );

            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Username and password are required."

                });

            }


            const admin =
                await Admin.findOne({
                    username
                });


            if (!admin) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid administrator username or password."

                });

            }


            if (
                admin.active === false
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "This administrator account is inactive."

                });

            }


            const passwordMatches =
                await bcrypt.compare(
                    password,
                    admin.password
                );


            if (!passwordMatches) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid administrator username or password."

                });

            }


            /*
            |--------------------------------------------------------------------------
            | CREATE JWT
            |--------------------------------------------------------------------------
            */

            const token =
                jwt.sign(

                    {
                        sub:
                            admin._id.toString(),

                        username:
                            admin.username,

                        name:
                            admin.name,

                        role:
                            admin.role,

                        type:
                            "admin"
                    },

                    getJwtSecret(),

                    {
                        expiresIn:
                            JWT_EXPIRES_IN
                    }

                );


            return res.status(200).json({

                success: true,

                message:
                    "Administrator login successful.",

                token,

                expiresIn:
                    JWT_EXPIRES_IN,

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

        } catch (error) {

            console.error(
                "Administrator login error:",
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
| CURRENT ADMINISTRATOR
|--------------------------------------------------------------------------
*/

router.get(
    "/me",
    requireAdmin,
    async (req, res) => {

        try {

            const admin =
                await Admin.findById(
                    req.admin.id
                ).select(
                    "-password"
                );


            if (!admin) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Administrator account no longer exists."

                });

            }


            if (
                admin.active === false
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Administrator account is inactive."

                });

            }


            return res.status(200).json({

                success: true,

                admin: {

                    id:
                        admin._id,

                    username:
                        admin.username,

                    name:
                        admin.name,

                    role:
                        admin.role,

                    active:
                        admin.active

                }

            });

        } catch (error) {

            console.error(
                "Admin verification error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to verify administrator."

            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

router.post(
    "/logout",
    requireAdmin,
    (req, res) => {

        return res.status(200).json({

            success: true,

            message:
                "Administrator logout acknowledged."

        });

    }
);


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
|
| IMPORTANT:
| We export BOTH the router and requireAdmin.
| server.js will use:
|
| const { router: adminRoutes } = require("./routes/admin");
|
|--------------------------------------------------------------------------
*/

module.exports = {

    router,

    requireAdmin

};