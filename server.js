"use strict";

/*
|--------------------------------------------------------------------------
| DON STEVE IMPERIAL HOTEL
| MAIN SERVER
|--------------------------------------------------------------------------
| JWT authentication
| Express sessions completely removed
|--------------------------------------------------------------------------
*/

require("dotenv").config();

const express = require("express");
const path = require("path");

const connectDB = require("./config/database");

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

const roomsRoutes = require("./routes/rooms");

const imageRoutes = require("./routes/images");

const {
    router: adminRoutes
} = require("./routes/admin");

const bookingRoutes = require("./routes/bookings");

const contactRoutes = require("./routes/contact");

/*
|--------------------------------------------------------------------------
| ENVIRONMENT CHECK
|--------------------------------------------------------------------------
*/

if (!process.env.JWT_SECRET) {
    console.error(
        "ERROR: JWT_SECRET is missing from the environment."
    );

    process.exit(1);
}

/*
|--------------------------------------------------------------------------
| EXPRESS APPLICATION
|--------------------------------------------------------------------------
*/

const app = express();

/*
|--------------------------------------------------------------------------
| PORT
|--------------------------------------------------------------------------
|
| Render provides process.env.PORT automatically.
| Locally, the application falls back to port 3000.
|
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

/*
|--------------------------------------------------------------------------
| BODY PARSING
|--------------------------------------------------------------------------
*/

app.use(
    express.json({
        limit: "2mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "2mb"
    })
);

/*
|--------------------------------------------------------------------------
| STATIC PUBLIC FILES
|--------------------------------------------------------------------------
*/

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    "/api/rooms",
    roomsRoutes
);

app.use(
    "/api/images",
    imageRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/bookings",
    bookingRoutes
);

app.use(
    "/api/contact",
    contactRoutes
);

/*
|--------------------------------------------------------------------------
| MAIN WEBSITE
|--------------------------------------------------------------------------
*/

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);

/*
|--------------------------------------------------------------------------
| WEBSITE PAGES
|--------------------------------------------------------------------------
*/

app.get(
    "/booking",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "booking.html"
            )
        );

    }
);

app.get(
    "/booking.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "booking.html"
            )
        );

    }
);

app.get(
    "/rooms",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "rooms.html"
            )
        );

    }
);

app.get(
    "/rooms.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "rooms.html"
            )
        );

    }
);

app.get(
    "/contact",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "contact.html"
            )
        );

    }
);

app.get(
    "/contact.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "contact.html"
            )
        );

    }
);

app.get(
    "/about",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "about.html"
            )
        );

    }
);

app.get(
    "/about.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "about.html"
            )
        );

    }
);

/*
|--------------------------------------------------------------------------
| ADMIN PAGES
|--------------------------------------------------------------------------
|
| The HTML pages themselves are public.
|
| The private dashboard data is protected by JWT middleware
| inside the API routes.
|
| admin.js checks /api/admin/me before loading private data.
|
|--------------------------------------------------------------------------
*/

app.get(
    "/admin",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin",
                "index.html"
            )
        );

    }
);

app.get(
    "/admin/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin",
                "index.html"
            )
        );

    }
);

app.get(
    "/admin/index.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin",
                "index.html"
            )
        );

    }
);

app.get(
    "/admin/login",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin",
                "login.html"
            )
        );

    }
);

app.get(
    "/admin/login.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin",
                "login.html"
            )
        );

    }
);

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "Don Steve Imperial Hotel API is running.",

            timestamp:
                new Date().toISOString()

        });

    }
);

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use(
    (req, res) => {

        if (
            req.originalUrl.startsWith("/api/")
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "API endpoint not found."

            });

        }

        res.status(404).send(
            "Page not found."
        );

    }
);

/*
|--------------------------------------------------------------------------
| ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use(
    (error, req, res, next) => {

        console.error(
            "Server error:",
            error
        );

        if (res.headersSent) {

            return next(error);

        }

        res.status(
            error.status || 500
        ).json({

            success: false,

            message:
                "An unexpected server error occurred."

        });

    }
);

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

async function startServer() {

    try {

        console.log("");
        console.log(
            "Connecting to MongoDB..."
        );

        await connectDB();

        console.log(
            "MongoDB connected successfully."
        );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT FOR RENDER
        |--------------------------------------------------------------------------
        |
        | Bind to 0.0.0.0 so Render can reach the application.
        |
        |--------------------------------------------------------------------------
        */

        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log("");
                console.log(
                    "=========================================="
                );

                console.log(
                    " DON STEVE IMPERIAL HOTEL"
                );

                console.log(
                    "=========================================="
                );

                console.log(
                    ` Server running on port ${PORT}`
                );

                console.log(
                    ` http://localhost:${PORT}`
                );

                console.log(
                    ` Admin: http://localhost:${PORT}/admin/login.html`
                );

                console.log(
                    " JWT authentication: ENABLED"
                );

                console.log(
                    " Express sessions: DISABLED"
                );

                console.log(
                    "=========================================="
                );

                console.log("");

            }
        );

    } catch (error) {

        console.error("");
        console.error(
            "FAILED TO START SERVER"
        );
        console.error("");

        console.error(error);

        console.error("");

        process.exit(1);

    }

}

startServer();