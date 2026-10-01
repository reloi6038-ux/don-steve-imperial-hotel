"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeLogin();

    }
);


/*
|--------------------------------------------------------------------------
| INITIALIZE LOGIN
|--------------------------------------------------------------------------
*/

function initializeLogin() {

    const form =
        document.querySelector(
            "#adminLoginForm"
        );


    if (!form) {

        console.error(
            "Admin login form was not found."
        );

        return;

    }


    form.addEventListener(
        "submit",
        handleLogin
    );


    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING SESSION
    |--------------------------------------------------------------------------
    */

    checkExistingSession();

}


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

async function handleLogin(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const usernameInput =
        form.querySelector(
            '[name="username"]'
        )
        ||
        document.querySelector(
            "#username"
        );


    const passwordInput =
        form.querySelector(
            '[name="password"]'
        )
        ||
        document.querySelector(
            "#password"
        );


    const message =
        document.querySelector(
            "#loginMessage"
        )
        ||
        document.querySelector(
            ".login-message"
        );


    const button =
        form.querySelector(
            'button[type="submit"]'
        );


    const username =
        String(
            usernameInput?.value || ""
        ).trim();


    const password =
        String(
            passwordInput?.value || ""
        );


    if (
        !username ||
        !password
    ) {

        showLoginMessage(
            "Please enter your username and password.",
            "error"
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | DISABLE BUTTON
    |--------------------------------------------------------------------------
    */

    if (button) {

        button.disabled =
            true;

        button.dataset.originalText =
            button.textContent;

        button.textContent =
            "SIGNING IN...";

    }


    showLoginMessage(
        "",
        ""
    );


    try {

        const response =
            await fetch(
                "/api/admin/login",
                {
                    method: "POST",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            username,
                            password
                        })
                }
            );


        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let data;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            throw new Error(
                "The server did not return a valid login response."
            );

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Login failed."
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Login failed."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        showLoginMessage(
            "Login successful. Opening administrator dashboard...",
            "success"
        );


        setTimeout(
            () => {

                window.location.href =
                    "/admin";

            },
            700
        );


    } catch (error) {

        console.error(
            "Administrator login error:",
            error
        );


        showLoginMessage(
            error.message ||
            "Unable to sign in.",
            "error"
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                button.dataset.originalText ||
                "SIGN IN";

        }

    }

}


/*
|--------------------------------------------------------------------------
| CHECK EXISTING SESSION
|--------------------------------------------------------------------------
*/

async function checkExistingSession() {

    try {

        const response =
            await fetch(
                "/api/admin/me",
                {
                    method: "GET",

                    credentials:
                        "same-origin",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (
            response.status !== 200
        ) {

            return;

        }


        const data =
            await response.json();


        if (
            data.success &&
            data.authenticated
        ) {

            window.location.href =
                "/admin";

        }

    } catch (error) {

        /*
        |--------------------------------------------------------------------------
        | Do nothing.
        |--------------------------------------------------------------------------
        |
        | A visitor who is not logged in should simply remain on
        | the login page.
        |
        */

        console.log(
            "No existing administrator session."
        );

    }

}


/*
|--------------------------------------------------------------------------
| LOGIN MESSAGE
|--------------------------------------------------------------------------
*/

function showLoginMessage(
    message,
    type
) {

    let element =
        document.querySelector(
            "#loginMessage"
        );


    if (!element) {

        element =
            document.querySelector(
                ".login-message"
            );

    }


    if (!element) {

        return;

    }


    element.textContent =
        message || "";


    element.className =
        "login-message";


    if (type) {

        element.classList.add(
            type
        );

    }


    element.style.display =
        message
            ? "block"
            : "none";

}