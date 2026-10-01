require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");


// =====================================================
// DATABASE
// =====================================================

const connectDB =
    require("./config/database");


// =====================================================
// ROUTES
// =====================================================

const roomRoutes =
    require("./routes/rooms");

const imageRoutes =
    require("./routes/images");

const bookingRoutes =
    require("./routes/bookings");

const contactRoutes =
    require("./routes/contact");

const adminRoutes =
    require("./routes/admin");


// =====================================================
// EXPRESS APP
// =====================================================

const app = express();


// =====================================================
// BASIC APP SETTINGS
// =====================================================

app.disable(
    "x-powered-by"
);


// =====================================================
// BODY PARSING
// =====================================================

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// ADMIN SESSION
// =====================================================

app.use(
    session({
        name: "hotel.sid",

        secret:
            process.env.SESSION_SECRET ||
            "don-steve-imperial-hotel-development-secret",

        resave: false,

        saveUninitialized: false,

        cookie: {

            httpOnly: true,

            secure:
                process.env.NODE_ENV ===
                "production",

            sameSite: "lax",

            maxAge:
                1000 *
                60 *
                60 *
                8

        }

    })
);


// =====================================================
// API ROUTES
// =====================================================


// -----------------------------------------------------
// ROOM API
// -----------------------------------------------------

app.use(
    "/api/rooms",
    roomRoutes
);


// -----------------------------------------------------
// AI IMAGE API
// -----------------------------------------------------

app.use(
    "/api/images",
    imageRoutes
);


// -----------------------------------------------------
// ADMIN API
// -----------------------------------------------------

app.use(
    "/api/admin",
    adminRoutes.router
);


// -----------------------------------------------------
// BOOKING API
// -----------------------------------------------------

app.use(
    "/api/bookings",
    bookingRoutes
);


// -----------------------------------------------------
// CONTACT API
// -----------------------------------------------------
// This was the missing route.
//
// Contact form:
// POST /api/contact
//
// Admin messages:
// GET    /api/contact/admin
// PATCH  /api/contact/admin/:id
// DELETE /api/contact/admin/:id
// -----------------------------------------------------

app.use(
    "/api/contact",
    contactRoutes
);


// =====================================================
// ADMIN PAGE AUTHENTICATION
// =====================================================

function requireAdminPage(
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


    return res.redirect(
        "/admin/login.html"
    );

}


// =====================================================
// PUBLIC ADMIN LOGIN PAGE
// =====================================================
//
// This must come BEFORE protected admin pages.
// =====================================================

app.get(
    "/admin/login.html",
    (req, res) => {

        // -------------------------------------------------
        // Already logged in?
        // -------------------------------------------------

        if (
            req.session &&
            req.session.admin
        ) {

            return res.redirect(
                "/admin"
            );

        }


        return res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin",
                "login.html"
            )
        );

    }
);


// =====================================================
// PROTECTED ADMIN DASHBOARD
// =====================================================

app.get(
    "/admin",
    requireAdminPage,
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


// =====================================================
// PROTECTED ADMIN DASHBOARD WITH SLASH
// =====================================================

app.get(
    "/admin/",
    requireAdminPage,
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


// =====================================================
// PROTECTED ADMIN DASHBOARD FILE
// =====================================================

app.get(
    "/admin/index.html",
    requireAdminPage,
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


// =====================================================
// PUBLIC WEBSITE FILES
// =====================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// =====================================================
// HOMEPAGE
// =====================================================

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


// =====================================================
// BOOKING PAGE
// =====================================================

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


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Don Steve Imperial Hotel server is running.",

            timestamp:
                new Date().toISOString()

        });

    }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        // -------------------------------------------------
        // API 404
        // -------------------------------------------------

        if (
            req.path.startsWith(
                "/api/"
            )
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "API route not found."

            });

        }


        // -------------------------------------------------
        // WEBSITE 404
        // -------------------------------------------------

        return res.status(404).send(
            `
            <!DOCTYPE html>

            <html>

            <head>

                <title>
                    Page Not Found
                </title>

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                >

                <style>

                    body {
                        margin: 0;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #071521;
                        color: white;
                        font-family: Arial, sans-serif;
                        text-align: center;
                    }

                    h1 {
                        font-size: 60px;
                        margin-bottom: 10px;
                    }

                    a {
                        color: #c7a15a;
                        text-decoration: none;
                    }

                </style>

            </head>

            <body>

                <div>

                    <h1>
                        404
                    </h1>

                    <p>
                        The page you requested
                        could not be found.
                    </p>

                    <a href="/">
                        Return to Don Steve Imperial Hotel
                    </a>

                </div>

            </body>

            </html>
            `
        );

    }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Server error:",
            error
        );


        if (
            res.headersSent
        ) {

            return next(
                error
            );

        }


        return res.status(
            error.status || 500
        ).json({

            success: false,

            message:
                error.message ||
                "An unexpected server error occurred."

        });

    }
);


// =====================================================
// SERVER PORT
// =====================================================

const PORT =
    process.env.PORT || 3000;


// =====================================================
// START SERVER
// =====================================================

async function startServer() {

    try {

        console.log(
            "Connecting to MongoDB..."
        );


        await connectDB();


        console.log(
            "MongoDB connected successfully."
        );


        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    "----------------------------------------"
                );

                console.log(
                    "DON STEVE IMPERIAL HOTEL"
                );

                console.log(
                    `Server running on port ${PORT}`
                );

                console.log(
                    `Website: http://localhost:${PORT}`
                );

                console.log(
                    `Admin Login: http://localhost:${PORT}/admin/login.html`
                );

                console.log(
                    `Admin Dashboard: http://localhost:${PORT}/admin`
                );

                console.log(
                    `Booking: http://localhost:${PORT}/booking.html`
                );

                console.log(
                    `Contact API: http://localhost:${PORT}/api/contact`
                );

                console.log(
                    "----------------------------------------"
                );

            }
        );

    } catch (error) {

        console.error(
            "----------------------------------------"
        );

        console.error(
            "Unable to start the server."
        );

        console.error(
            error.message
        );

        console.error(
            "----------------------------------------"
        );


        process.exit(1);

    }

}


startServer();