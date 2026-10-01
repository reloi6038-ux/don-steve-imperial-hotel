require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin =
    require("./models/Admin");


async function createAdmin() {

    try {

        /*
        |--------------------------------------------------------------------------
        | CONNECT TO DATABASE
        |--------------------------------------------------------------------------
        */

        if (
            !process.env.MONGODB_URI
        ) {

            throw new Error(
                "MONGODB_URI is missing from .env"
            );

        }


        console.log(
            "Connecting to MongoDB..."
        );


        await mongoose.connect(
            process.env.MONGODB_URI
        );


        console.log(
            "MongoDB connected."
        );


        /*
        |--------------------------------------------------------------------------
        | ADMIN DETAILS
        |--------------------------------------------------------------------------
        |
        | Change these before running this script.
        |
        */

        const username =
            "admin";


        const password =
            "Admin@12345";


        const name =
            "Don Steve Hotel Administrator";


        /*
        |--------------------------------------------------------------------------
        | CHECK EXISTING ADMIN
        |--------------------------------------------------------------------------
        */

        const existingAdmin =
            await Admin.findOne({
                username
            });


        if (existingAdmin) {

            console.log(
                "An administrator with this username already exists."
            );

            await mongoose.disconnect();

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | HASH PASSWORD
        |--------------------------------------------------------------------------
        */

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        /*
        |--------------------------------------------------------------------------
        | CREATE ADMIN
        |--------------------------------------------------------------------------
        */

        const admin =
            await Admin.create({
                username,

                password:
                    hashedPassword,

                name,

                role:
                    "admin",

                active:
                    true
            });


        console.log(
            "----------------------------------------"
        );

        console.log(
            "Administrator created successfully."
        );

        console.log(
            `Username: ${admin.username}`
        );

        console.log(
            `Password: ${password}`
        );

        console.log(
            "----------------------------------------"
        );


        await mongoose.disconnect();


    } catch (error) {

        console.error(
            "Unable to create administrator:"
        );

        console.error(
            error.message
        );


        await mongoose.disconnect();

        process.exit(1);

    }

}


createAdmin();