"use strict";

const express =
    require("express");

const mongoose =
    require("mongoose");

const Contact =
    require("../models/Contact");

const { requireAdmin } =
    require("./admin");


const router =
    express.Router();


/*
|--------------------------------------------------------------------------
| PUBLIC - CONTACT FORM
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    async (req, res) => {

        try {

            const name =
                String(
                    req.body.name ||
                    ""
                ).trim();


            const email =
                String(
                    req.body.email ||
                    ""
                ).trim().toLowerCase();


            const message =
                String(
                    req.body.message ||
                    ""
                ).trim();


            if (!name) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name is required."

                });

            }


            if (!email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email address is required."

                });

            }


            if (!message) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Message is required."

                });

            }


            const contact =
                await Contact.create({

                    name,

                    email,

                    message,

                    status:
                        "unread"

                });


            return res.status(201).json({

                success: true,

                message:
                    "Your message has been sent successfully.",

                contact

            });

        } catch (error) {

            console.error(
                "Create contact message error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to send your message."

            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| ADMIN - ALL CONTACT MESSAGES
|--------------------------------------------------------------------------
*/

router.get(
    "/admin",
    requireAdmin,
    async (req, res) => {

        try {

            const messages =
                await Contact.find()
                    .sort({
                        createdAt: -1
                    });


            return res.status(200).json({

                success: true,

                messages

            });

        } catch (error) {

            console.error(
                "Get contact messages error:",
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


/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE CONTACT MESSAGE
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
                        "Invalid message ID."

                });

            }


            const allowedStatuses = [
                "unread",
                "read",
                "replied"
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
                        "Invalid message status."

                });

            }


            const contact =
                await Contact.findByIdAndUpdate(

                    req.params.id,

                    {
                        status
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


            return res.status(200).json({

                success: true,

                message:
                    "Contact message updated successfully.",

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


/*
|--------------------------------------------------------------------------
| ADMIN - DELETE CONTACT MESSAGE
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
                        "Invalid message ID."

                });

            }


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


            return res.status(200).json({

                success: true,

                message:
                    "Contact message deleted successfully."

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


module.exports =
    router;