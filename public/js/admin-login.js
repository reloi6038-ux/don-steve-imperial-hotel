document.addEventListener("DOMContentLoaded", function () {

    const loginForm =
        document.getElementById("adminLoginForm");

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const loginButton =
        document.getElementById("loginButton");

    const loginMessage =
        document.getElementById("loginMessage");


    if (!loginForm) {
        console.error(
            "Admin login form was not found."
        );

        return;
    }


    function showMessage(
        message,
        type
    ) {

        if (!loginMessage) {
            return;
        }

        loginMessage.textContent =
            message;

        loginMessage.className =
            "login-message";

        if (type) {
            loginMessage.classList.add(
                type
            );
        }

    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                usernameInput
                    ? usernameInput.value
                        .trim()
                        .toLowerCase()
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
                    "Please enter your username and password.",
                    "error"
                );

                return;
            }


            const originalButtonText =
                loginButton
                    ? loginButton.textContent
                    : "Sign In";


            if (loginButton) {

                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "Signing In...";

            }


            showMessage(
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
                                    username:
                                        username,

                                    password:
                                        password
                                }),

                            cache:
                                "no-store"
                        }
                    );


                const result =
                    await response.json()
                        .catch(
                            () => null
                        );


                console.log(
                    "Admin login response:",
                    result
                );


                if (
                    !response.ok ||
                    !result ||
                    !result.success
                ) {

                    throw new Error(
                        result?.message ||
                        "Invalid administrator credentials."
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | LOGIN SUCCESSFUL
                |--------------------------------------------------------------------------
                */

                showMessage(
                    "Login successful. Opening administrator dashboard...",
                    "success"
                );


                /*
                |--------------------------------------------------------------------------
                | VERIFY THE SESSION BEFORE REDIRECTING
                |--------------------------------------------------------------------------
                */

                const sessionResponse =
                    await fetch(
                        "/api/admin/me",
                        {
                            method: "GET",

                            credentials:
                                "same-origin",

                            headers: {
                                "Accept":
                                    "application/json"
                            },

                            cache:
                                "no-store"
                        }
                    );


                const sessionResult =
                    await sessionResponse
                        .json()
                        .catch(
                            () => null
                        );


                console.log(
                    "Admin session check:",
                    sessionResult
                );


                if (
                    !sessionResponse.ok ||
                    !sessionResult ||
                    !sessionResult.authenticated
                ) {

                    throw new Error(
                        "Login succeeded, but the administrator session was not established."
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | REDIRECT TO DASHBOARD
                |--------------------------------------------------------------------------
                */

                window.location.replace(
                    "/admin"
                );

            } catch (error) {

                console.error(
                    "Administrator login error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to sign in. Please try again.",
                    "error"
                );


                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        originalButtonText ||
                        "Sign In";

                }

            }

        }
    );

});