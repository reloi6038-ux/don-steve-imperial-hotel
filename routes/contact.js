const express = require("express");

const Contact = require("../models/Contact");

const router = express.Router();



/* =====================================================
   ADMIN AUTHENTICATION
===================================================== */

function requireAdmin(req, res, next) {

    if (req.session && req.session.admin) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Administrator authentication required."
    });

}



/* =====================================================
   EMAIL VALIDATION
===================================================== */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

}



/* =====================================================
   SUBMIT CONTACT MESSAGE
   POST /api/contact
===================================================== */

router.post(
    "/",
    async (req, res) => {

        try {

            const {
                name,
                email,
                phone,
                subject,
                message
            } = req.body;


            const cleanName =
                String(name || "").trim();

            const cleanEmail =
                String(email || "")
                    .trim()
                    .toLowerCase();

            const cleanPhone =
                String(phone || "").trim();

            const cleanSubject =
                String(subject || "").trim();

            const cleanMessage =
                String(message || "").trim();



            /* -----------------------------------------
               REQUIRED FIELDS
            ----------------------------------------- */

            if (!cleanName) {

                return res.status(400).json({
                    success: false,
                    message: "Please enter your full name."
                });

            }


            if (!cleanEmail) {

                return res.status(400).json({
                    success: false,
                    message: "Please enter your email address."
                });

            }


            if (!isValidEmail(cleanEmail)) {

                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address."
                });

            }


            if (!cleanMessage) {

                return res.status(400).json({
                    success: false,
                    message: "Please enter your message."
                });

            }



            /* -----------------------------------------
               SAVE MESSAGE
            ----------------------------------------- */

            const contact =
                await Contact.create({

                    name: cleanName,

                    email: cleanEmail,

                    phone: cleanPhone,

                    subject: cleanSubject,

                    message: cleanMessage,

                    status: "unread"

                });



            return res.status(201).json({

                success: true,

                message:
                    "Your message has been received.",

                contactId: contact._id

            });


        } catch (error) {

            console.error(
                "Contact submission error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to send your message right now. Please try again."

            });

        }

    }
);



/* =====================================================
   GET ALL CONTACT MESSAGES
   GET /api/contact/admin
===================================================== */

router.get(
    "/admin",
    requireAdmin,
    async (req, res) => {

        try {

            const messages =
                await Contact
                    .find({})
                    .sort({
                        createdAt: -1
                    })
                    .lean();


            return res.json({

                success: true,

                messages

            });


        } catch (error) {

            console.error(
                "Load contact messages error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load contact messages."

            });

        }

    }
);



/* =====================================================
   UPDATE CONTACT MESSAGE STATUS
   PATCH /api/contact/admin/:id
===================================================== */

router.patch(
    "/admin/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            const allowedStatuses = [
                "unread",
                "read",
                "replied"
            ];


            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid contact message status."

                });

            }



            const contact =
                await Contact.findByIdAndUpdate(

                    req.params.id,

                    {
                        status: status
                    },

                    {
                        new: true,
                        runValidators: true
                    }

                );


            if (!contact) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Contact message not found."

                });

            }



            return res.json({

                success: true,

                message:
                    "Contact message updated.",

                contact

            });


        } catch (error) {

            console.error(
                "Update contact message error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update contact message."

            });

        }

    }
);



/* =====================================================
   DELETE CONTACT MESSAGE
   DELETE /api/contact/admin/:id
===================================================== */

router.delete(
    "/admin/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const contact =
                await Contact.findByIdAndDelete(
                    req.params.id
                );


            if (!contact) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Contact message not found."

                });

            }



            return res.json({

                success: true,

                message:
                    "Contact message deleted."

            });


        } catch (error) {

            console.error(
                "Delete contact message error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete contact message."

            });

        }

    }
);



/* =====================================================
   EXPORT
===================================================== */

module.exports = router;