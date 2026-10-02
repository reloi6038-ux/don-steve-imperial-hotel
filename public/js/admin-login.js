"use strict";


/*
|--------------------------------------------------------------------------
| DON STEVE IMPERIAL HOTEL
| ADMINISTRATOR LOGIN
|--------------------------------------------------------------------------
| JWT authentication
|--------------------------------------------------------------------------
*/


const ADMIN_TOKEN_KEY =
    "donSteveAdminToken";


/*
|--------------------------------------------------------------------------
| ELEMENTS
|--------------------------------------------------------------------------
*/

const loginForm =
    document.getElementById(
        "adminLoginForm"
    );

const usernameInput =
    document.getElementById(
        "username"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );


/*
|--------------------------------------------------------------------------
| MESSAGE
|--------------------------------------------------------------------------
*/

function showMessage(
    message,
    type = "error"
) {

    if (!loginMessage) {
        return;
    }


    loginMessage.textContent =
        message;


    loginMessage.className =
        "login-message " +
        type;

}


/*
|--------------------------------------------------------------------------
| CLEAR MESSAGE
|--------------------------------------------------------------------------
*/

function clearMessage() {

    if (!loginMessage) {
        return;
    }


    loginMessage.textContent =
        "";

    loginMessage.className =
        "login-message";

}


/*
|--------------------------------------------------------------------------
| BUTTON STATE
|--------------------------------------------------------------------------
*/

function setLoading(
    loading
) {

    if (!loginButton) {
        return;
    }


    loginButton.disabled =
        loading;


    loginButton.textContent =
        loading
            ? "Signing In..."
            : "Sign In";

}


/*
|--------------------------------------------------------------------------
| GET STORED TOKEN
|--------------------------------------------------------------------------
*/

function getStoredToken() {

    return localStorage.getItem(
        ADMIN_TOKEN_KEY
    );

}


/*
|--------------------------------------------------------------------------
| STORE TOKEN
|--------------------------------------------------------------------------
*/

function storeToken(
    token
) {

    if (!token) {
        return;
    }


    localStorage.setItem(
        ADMIN_TOKEN_KEY,
        token
    );

}


/*
|--------------------------------------------------------------------------
| REMOVE TOKEN
|--------------------------------------------------------------------------
*/

function removeToken() {

    localStorage.removeItem(
        ADMIN_TOKEN_KEY
    );

}


/*
|--------------------------------------------------------------------------
| VERIFY EXISTING TOKEN
|--------------------------------------------------------------------------
|
| If the administrator is already logged in, don't show the login
| form again. Verify the existing JWT with the server.
|--------------------------------------------------------------------------
*/

async function checkExistingLogin() {

    const token =
        getStoredToken();


    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/admin/me",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"
                    },

                    cache:
                        "no-store"
                }
            );


        if (
            response.ok
        ) {

            window.location.replace(
                "/admin/index.html"
            );

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | INVALID / EXPIRED TOKEN
        |--------------------------------------------------------------------------
        */

        removeToken();

    } catch (error) {

        console.error(
            "Existing administrator login check failed:",
            error
        );

    }

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


    clearMessage();


    const username =
        usernameInput
            ? usernameInput.value.trim()
            : "";


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    if (
        !username ||
        !password
    ) {

        showMessage(
            "Please enter your username and password."
        );

        return;

    }


    setLoading(true);


    try {

        const response =
            await fetch(
                "/api/admin/login",
                {

                    method: "POST",

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

                        }),

                    cache:
                        "no-store"

                }
            );


        /*
        |--------------------------------------------------------------------------
        | READ RESPONSE
        |--------------------------------------------------------------------------
        */

        let data = null;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            console.error(
                "Login response was not valid JSON:",
                jsonError
            );

        }


        /*
        |--------------------------------------------------------------------------
        | LOGIN FAILED
        |--------------------------------------------------------------------------
        */

        if (
            !response.ok ||
            !data ||
            !data.success
        ) {

            showMessage(

                data &&
                data.message

                    ? data.message

                    : "Unable to sign in. Please check your credentials."

            );

            setLoading(false);

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | JWT REQUIRED
        |--------------------------------------------------------------------------
        */

        if (
            !data.token
        ) {

            console.error(
                "Login succeeded but no JWT was returned."
            );


            showMessage(
                "Login succeeded, but the authentication token was not received."
            );


            setLoading(false);

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | SAVE JWT
        |--------------------------------------------------------------------------
        */

        storeToken(
            data.token
        );


        /*
        |--------------------------------------------------------------------------
        | SUCCESS MESSAGE
        |--------------------------------------------------------------------------
        */

        showMessage(
            "Login successful. Opening administrator dashboard...",
            "success"
        );


        /*
        |--------------------------------------------------------------------------
        | VERIFY JWT BEFORE REDIRECT
        |--------------------------------------------------------------------------
        |
        | This makes sure the token we just stored actually works.
        |--------------------------------------------------------------------------
        */

        const verifyResponse =
            await fetch(
                "/api/admin/me",
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${data.token}`,

                        "Accept":
                            "application/json"

                    },

                    cache:
                        "no-store"

                }
            );


        if (
            !verifyResponse.ok
        ) {

            removeToken();


            showMessage(
                "Login was completed, but the administrator token could not be verified."
            );


            setLoading(false);

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | GO TO DASHBOARD
        |--------------------------------------------------------------------------
        */

        window.location.replace(
            "/admin/index.html"
        );

    } catch (error) {

        console.error(
            "Administrator login request failed:",
            error
        );


        showMessage(
            "Unable to connect to the hotel server. Please try again."
        );


        setLoading(false);

    }

}


/*
|--------------------------------------------------------------------------
| FORM EVENT
|--------------------------------------------------------------------------
*/

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        handleLogin
    );

}


/*
|--------------------------------------------------------------------------
| ENTER KEY SUPPORT
|--------------------------------------------------------------------------
*/

if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                if (
                    loginForm &&
                    typeof loginForm.requestSubmit ===
                        "function"
                ) {

                    loginForm.requestSubmit();

                }

            }

        }
    );

}


/*
|--------------------------------------------------------------------------
| CHECK EXISTING LOGIN
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkExistingLogin();

    }
);