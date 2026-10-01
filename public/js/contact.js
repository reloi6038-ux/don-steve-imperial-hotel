document.addEventListener("DOMContentLoaded", function () {

    const contactForm =
        document.getElementById("contactForm");

    const contactMessage =
        document.getElementById("contactMessage");


    if (!contactForm) {
        console.error("Contact form not found.");
        return;
    }


    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const submitButton =
                contactForm.querySelector(
                    'button[type="submit"]'
                );


            const formData =
                new FormData(contactForm);


            const data = {

                name:
                    String(
                        formData.get("name") || ""
                    ).trim(),

                email:
                    String(
                        formData.get("email") || ""
                    ).trim(),

                phone:
                    String(
                        formData.get("phone") || ""
                    ).trim(),

                subject:
                    String(
                        formData.get("subject") || ""
                    ).trim(),

                message:
                    String(
                        formData.get("message") || ""
                    ).trim()

            };


            /*
            |--------------------------------------------------------------------------
            | VALIDATION
            |--------------------------------------------------------------------------
            */

            if (!data.name) {

                showMessage(
                    "Please enter your full name.",
                    "error"
                );

                return;
            }


            if (!data.email) {

                showMessage(
                    "Please enter your email address.",
                    "error"
                );

                return;
            }


            if (!isValidEmail(data.email)) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            if (!data.message) {

                showMessage(
                    "Please enter your message.",
                    "error"
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | DISABLE BUTTON
            |--------------------------------------------------------------------------
            */

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.innerHTML =
                    `
                    Sending...
                    <span>...</span>
                    `;

            }


            clearMessage();


            /*
            |--------------------------------------------------------------------------
            | SEND TO SERVER
            |--------------------------------------------------------------------------
            */

            try {

                const response =
                    await fetch(
                        "/api/contact",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );


                let result;

                try {

                    result =
                        await response.json();

                } catch (jsonError) {

                    throw new Error(
                        "The server returned an invalid response."
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | SERVER ERROR
                |--------------------------------------------------------------------------
                */

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Unable to send your message."
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | SUCCESS
                |--------------------------------------------------------------------------
                */

                contactForm.reset();

                showSuccessMessage();


            } catch (error) {

                console.error(
                    "Contact form error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to send your message. Please try again.",
                    "error"
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.innerHTML =
                        `
                        Send Message
                        <span>→</span>
                        `;

                }

            }

        }
    );


    /*
    |--------------------------------------------------------------------------
    | EMAIL VALIDATION
    |--------------------------------------------------------------------------
    */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        );

    }


    /*
    |--------------------------------------------------------------------------
    | SHOW ERROR MESSAGE
    |--------------------------------------------------------------------------
    */

    function showMessage(
        message,
        type = "error"
    ) {

        if (!contactMessage) {
            return;
        }


        contactMessage.className =
            "contact-form-message " +
            type;


        contactMessage.style.display =
            "block";


        contactMessage.innerHTML =
            `
            ${message}
            `;


        contactMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    /*
    |--------------------------------------------------------------------------
    | CLEAR MESSAGE
    |--------------------------------------------------------------------------
    */

    function clearMessage() {

        if (!contactMessage) {
            return;
        }


        contactMessage.innerHTML = "";

        contactMessage.className =
            "contact-form-message";

        contactMessage.style.display =
            "none";

    }


    /*
    |--------------------------------------------------------------------------
    | SUCCESS MESSAGE
    |--------------------------------------------------------------------------
    */

    function showSuccessMessage() {

        if (!contactMessage) {
            return;
        }


        contactMessage.className =
            "contact-form-message success";


        contactMessage.style.display =
            "flex";


        contactMessage.innerHTML =
            `
            <div class="success-icon">
                ✓
            </div>

            <div class="success-content">

                <strong>
                    Message Received
                </strong>

                <p>
                    Thank you for contacting
                    Don Steve Imperial Hotel.
                    Our guest services team has
                    received your enquiry and will
                    be in touch with you shortly.
                </p>

                <button
                    type="button"
                    class="send-another-button"
                    id="sendAnotherMessage"
                >
                    Send Another Message
                </button>

            </div>
            `;


        contactMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        const sendAnotherButton =
            document.getElementById(
                "sendAnotherMessage"
            );


        if (sendAnotherButton) {

            sendAnotherButton.addEventListener(
                "click",
                function () {

                    clearMessage();

                    contactForm.reset();

                    const nameInput =
                        document.getElementById("name");

                    if (nameInput) {
                        nameInput.focus();
                    }

                }
            );

        }

    }

});