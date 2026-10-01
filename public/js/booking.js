document.addEventListener("DOMContentLoaded", function () {

    console.log(
        "Don Steve Imperial Hotel booking system initialized."
    );

    setupMobileMenu();
    setupBookingForm();
    setupDateValidation();
    setupImageSlideshow();
    setupPriceCalculator();

    setMinimumDates();
    selectRoomFromUrl();

});


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const button =
        document.getElementById("mobileMenuButton");

    const navigation =
        document.getElementById("navigation");

    if (!button || !navigation) {
        return;
    }

    button.addEventListener("click", function () {

        const isOpen =
            navigation.style.display === "flex";

        if (isOpen) {

            navigation.style.display = "none";

        } else {

            navigation.style.display = "flex";

            navigation.style.position = "absolute";
            navigation.style.top = "78px";
            navigation.style.left = "0";
            navigation.style.right = "0";
            navigation.style.background = "#071521";
            navigation.style.padding = "25px";
            navigation.style.flexDirection = "column";
            navigation.style.alignItems = "flex-start";

        }

    });

}


/* =========================================================
   ROOM PRICES
========================================================= */

const roomPrices = {

    "Deluxe Room": 250000,

    "Deluxe King Room": 250000,

    "Executive Suite": 450000,

    "Presidential Suite": 850000

};


/* =========================================================
   BOOKING FORM
========================================================= */

function setupBookingForm() {

    const form =
        document.getElementById("bookingForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        clearBookingMessage();

        const submitButton =
            document.getElementById(
                "bookingSubmitButton"
            );

        const guestName =
            document.getElementById("guestName");

        const email =
            document.getElementById("email");

        const phone =
            document.getElementById("phone");

        const country =
            document.getElementById("country");

        const checkIn =
            document.getElementById("checkIn");

        const checkOut =
            document.getElementById("checkOut");

        const room =
            document.getElementById("room");

        const guests =
            document.getElementById("guests");

        const specialRequests =
            document.getElementById(
                "specialRequests"
            );


        /* -----------------------------------------
           VALIDATION
        ----------------------------------------- */

        if (!guestName.value.trim()) {

            showBookingMessage(
                "Please enter the guest's full name.",
                "error"
            );

            focusElement(guestName);

            return;
        }


        if (!email.value.trim()) {

            showBookingMessage(
                "Please enter your email address.",
                "error"
            );

            focusElement(email);

            return;
        }


        if (!isValidEmail(email.value.trim())) {

            showBookingMessage(
                "Please enter a valid email address.",
                "error"
            );

            focusElement(email);

            return;
        }


        if (!phone.value.trim()) {

            showBookingMessage(
                "Please enter your phone number.",
                "error"
            );

            focusElement(phone);

            return;
        }


        if (!checkIn.value) {

            showBookingMessage(
                "Please select your check-in date.",
                "error"
            );

            focusElement(checkIn);

            return;
        }


        if (!checkOut.value) {

            showBookingMessage(
                "Please select your check-out date.",
                "error"
            );

            focusElement(checkOut);

            return;
        }


        if (!room.value) {

            showBookingMessage(
                "Please select a room or suite.",
                "error"
            );

            focusElement(room);

            return;
        }


        if (!validateBookingDates()) {
            return;
        }


        const guestCount =
            Number(guests.value || 1);


        if (
            !Number.isInteger(guestCount) ||
            guestCount < 1 ||
            guestCount > 20
        ) {

            showBookingMessage(
                "Guest count must be between 1 and 20.",
                "error"
            );

            focusElement(guests);

            return;
        }


        /* -----------------------------------------
           DISABLE BUTTON
        ----------------------------------------- */

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Sending Reservation...";

        }


        showBookingMessage(
            "Submitting your reservation request...",
            "loading"
        );


        /* -----------------------------------------
           REQUEST
        ----------------------------------------- */

        const bookingData = {

            guestName:
                guestName.value.trim(),

            name:
                guestName.value.trim(),

            email:
                email.value.trim().toLowerCase(),

            phone:
                phone.value.trim(),

            country:
                country.value.trim(),

            checkIn:
                checkIn.value,

            checkOut:
                checkOut.value,

            guests:
                guestCount,

            room:
                room.value,

            roomType:
                room.value,

            specialRequests:
                specialRequests.value.trim(),

            requests:
                specialRequests.value.trim()

        };


        try {

            const response =
                await fetch(
                    "/api/bookings",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                bookingData
                            )
                    }
                );


            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";


            let result;


            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                result =
                    await response.json();

            } else {

                const text =
                    await response.text();

                throw new Error(
                    text ||
                    "The server returned an unexpected response."
                );

            }


            if (!response.ok || !result.success) {

                throw new Error(
                    result.message ||
                    "Unable to submit reservation."
                );

            }


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            clearBookingMessage();

            showBookingSuccess(
                result.booking ||
                result
            );

            form.reset();

            setMinimumDates();

            updateReservationSummary();


        } catch (error) {

            console.error(
                "Booking submission error:",
                error
            );

            showBookingMessage(
                error.message ||
                "Unable to submit your reservation. Please try again.",
                "error"
            );


        } finally {

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Request Reservation";

            }

        }

    });

}


/* =========================================================
   DATE VALIDATION
========================================================= */

function setupDateValidation() {

    const checkIn =
        document.getElementById("checkIn");

    const checkOut =
        document.getElementById("checkOut");


    if (!checkIn || !checkOut) {
        return;
    }


    checkIn.addEventListener(
        "change",
        function () {

            updateCheckoutMinimum();

            validateBookingDates();

            updateReservationSummary();

        }
    );


    checkOut.addEventListener(
        "change",
        function () {

            validateBookingDates();

            updateReservationSummary();

        }
    );

}


/* =========================================================
   MINIMUM DATES
========================================================= */

function setMinimumDates() {

    const checkIn =
        document.getElementById("checkIn");

    const checkOut =
        document.getElementById("checkOut");


    if (!checkIn || !checkOut) {
        return;
    }


    const today =
        getTodayDateString();


    checkIn.min = today;

    checkOut.min = today;


    if (checkIn.value) {

        updateCheckoutMinimum();

    }

}


/* =========================================================
   UPDATE CHECKOUT MINIMUM
========================================================= */

function updateCheckoutMinimum() {

    const checkIn =
        document.getElementById("checkIn");

    const checkOut =
        document.getElementById("checkOut");


    if (!checkIn || !checkOut) {
        return;
    }


    if (!checkIn.value) {

        checkOut.min =
            getTodayDateString();

        return;
    }


    const arrival =
        parseDateOnly(checkIn.value);


    arrival.setDate(
        arrival.getDate() + 1
    );


    const minimumCheckout =
        formatDateInput(arrival);


    checkOut.min =
        minimumCheckout;


    if (
        checkOut.value &&
        checkOut.value < minimumCheckout
    ) {

        checkOut.value = "";

    }

}


/* =========================================================
   VALIDATE BOOKING DATES
========================================================= */

function validateBookingDates() {

    const checkIn =
        document.getElementById("checkIn");

    const checkOut =
        document.getElementById("checkOut");


    if (!checkIn || !checkOut) {
        return false;
    }


    if (
        !checkIn.value ||
        !checkOut.value
    ) {

        return true;

    }


    const arrival =
        parseDateOnly(checkIn.value);

    const departure =
        parseDateOnly(checkOut.value);


    if (departure <= arrival) {

        showBookingMessage(
            "Check-out must be after check-in.",
            "error"
        );

        focusElement(checkOut);

        return false;

    }


    return true;

}


/* =========================================================
   ROOM FROM URL
========================================================= */

function selectRoomFromUrl() {

    const roomField =
        document.getElementById("room");


    if (!roomField) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const room =
        params.get("room");


    if (!room) {
        return;
    }


    const decodedRoom =
        decodeURIComponent(room);


    const options =
        Array.from(
            roomField.options
        );


    const matchingOption =
        options.find(function (option) {

            return (
                option.value.toLowerCase() ===
                decodedRoom.toLowerCase()
            );

        });


    if (matchingOption) {

        roomField.value =
            matchingOption.value;

        updateReservationSummary();

    }

}


/* =========================================================
   IMAGE SLIDESHOW
========================================================= */

function setupImageSlideshow() {

    const image =
        document.getElementById(
            "bookingSlideshow"
        );


    if (!image) {
        return;
    }


    const images = [

        "/images/deluxe-king-room.jpg",

        "/images/executive-suite.jpg",

        "/images/presidential-suite.jpg",

        "/images/elegant-interior.jpg"

    ];


    let currentIndex = 0;


    setInterval(function () {

        currentIndex =
            (currentIndex + 1) %
            images.length;


        image.style.opacity = "0";


        setTimeout(function () {

            image.src =
                images[currentIndex];

            image.style.opacity = "1";

        }, 350);


    }, 5000);

}


/* =========================================================
   PRICE CALCULATOR
========================================================= */

function setupPriceCalculator() {

    const room =
        document.getElementById("room");

    const checkIn =
        document.getElementById("checkIn");

    const checkOut =
        document.getElementById("checkOut");


    if (
        !room ||
        !checkIn ||
        !checkOut
    ) {

        return;

    }


    room.addEventListener(
        "change",
        updateReservationSummary
    );


    checkIn.addEventListener(
        "change",
        updateReservationSummary
    );


    checkOut.addEventListener(
        "change",
        updateReservationSummary
    );


    updateReservationSummary();

}


/* =========================================================
   UPDATE RESERVATION SUMMARY
========================================================= */

function updateReservationSummary() {

    const roomField =
        document.getElementById("room");

    const checkIn =
        document.getElementById("checkIn");

    const checkOut =
        document.getElementById("checkOut");

    const summaryRoom =
        document.getElementById("summaryRoom");

    const summaryNights =
        document.getElementById("summaryNights");

    const summaryRate =
        document.getElementById("summaryRate");

    const summaryTotal =
        document.getElementById("summaryTotal");


    if (
        !roomField ||
        !checkIn ||
        !checkOut
    ) {

        return;

    }


    const selectedRoom =
        roomField.value;


    const price =
        roomPrices[selectedRoom] || 0;


    let nights = 0;


    if (
        checkIn.value &&
        checkOut.value
    ) {

        const arrival =
            parseDateOnly(
                checkIn.value
            );


        const departure =
            parseDateOnly(
                checkOut.value
            );


        const difference =
            departure.getTime() -
            arrival.getTime();


        nights =
            Math.round(
                difference /
                (1000 * 60 * 60 * 24)
            );


        if (nights < 0) {
            nights = 0;
        }

    }


    const total =
        price * nights;


    if (summaryRoom) {

        summaryRoom.textContent =
            selectedRoom ||
            "Select a room";

    }


    if (summaryNights) {

        summaryNights.textContent =
            `${nights} ${
                nights === 1
                    ? "night"
                    : "nights"
            }`;

    }


    if (summaryRate) {

        summaryRate.textContent =
            `${formatCurrency(
                price
            )} / night`;

    }


    if (summaryTotal) {

        summaryTotal.textContent =
            formatCurrency(total);

    }

}


/* =========================================================
   FORMAT CURRENCY
========================================================= */

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }
    ).format(amount || 0);

}


/* =========================================================
   SUCCESS PANEL
========================================================= */

function showBookingSuccess(booking) {

    const panel =
        document.getElementById(
            "bookingSuccessPanel"
        );


    if (!panel) {
        return;
    }


    const reservationId =
        booking.id ||
        booking._id ||
        "Pending";


    const room =
        booking.room ||
        booking.roomType ||
        "Selected accommodation";


    const guests =
        booking.guests ||
        1;


    const status =
        booking.status ||
        "pending";


    const checkIn =
        booking.checkIn
            ? formatDate(
                booking.checkIn
            )
            : "Pending";


    const checkOut =
        booking.checkOut
            ? formatDate(
                booking.checkOut
            )
            : "Pending";


    panel.innerHTML = `

        <div class="success-icon">
            ✓
        </div>

        <h3>
            Reservation received.
        </h3>

        <p>
            Thank you for choosing
            Don Steve Imperial Hotel.
            Your reservation request has
            been successfully received.
        </p>

        <div class="booking-confirmation-details">

            <div class="confirmation-row">

                <span>
                    Reservation ID
                </span>

                <strong>
                    ${escapeHtml(
                        String(reservationId)
                    )}
                </strong>

            </div>

            <div class="confirmation-row">

                <span>
                    Accommodation
                </span>

                <strong>
                    ${escapeHtml(
                        String(room)
                    )}
                </strong>

            </div>

            <div class="confirmation-row">

                <span>
                    Guests
                </span>

                <strong>
                    ${escapeHtml(
                        String(guests)
                    )}
                </strong>

            </div>

            <div class="confirmation-row">

                <span>
                    Check-in
                </span>

                <strong>
                    ${escapeHtml(
                        checkIn
                    )}
                </strong>

            </div>

            <div class="confirmation-row">

                <span>
                    Check-out
                </span>

                <strong>
                    ${escapeHtml(
                        checkOut
                    )}
                </strong>

            </div>

            <div class="confirmation-row">

                <span>
                    Status
                </span>

                <strong>
                    ${escapeHtml(
                        String(status)
                    ).toUpperCase()}
                </strong>

            </div>

        </div>

        <a
            href="/"
            class="success-home-link"
        >
            Return to Hotel
        </a>

    `;


    panel.style.display = "block";


    panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   BOOKING MESSAGE
========================================================= */

function showBookingMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "bookingFormMessage"
        );


    if (!element) {
        return;
    }


    element.className =
        "booking-form-message";


    if (type === "error") {

        element.classList.add(
            "message-error"
        );

    }


    if (type === "loading") {

        element.classList.add(
            "message-loading"
        );

    }


    if (type === "success") {

        element.classList.add(
            "message-success"
        );

    }


    element.textContent =
        message;


    element.style.display =
        "block";

}


function clearBookingMessage() {

    const element =
        document.getElementById(
            "bookingFormMessage"
        );


    if (!element) {
        return;
    }


    element.textContent = "";

    element.className =
        "booking-form-message";

    element.style.display =
        "none";

}


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* =========================================================
   DATE HELPERS
========================================================= */

function getTodayDateString() {

    const today =
        new Date();


    return formatDateInput(today);

}


function parseDateOnly(value) {

    const parts =
        value.split("-").map(Number);


    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    );

}


function formatDateInput(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function formatDate(value) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Pending";

    }


    return new Intl.DateTimeFormat(
        "en-NG",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(date);

}


/* =========================================================
   FOCUS HELPER
========================================================= */

function focusElement(element) {

    if (!element) {
        return;
    }


    element.focus();


    element.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}