// ============================================================
// DON STEVE IMPERIAL HOTEL
// MAIN JAVASCRIPT
// ============================================================


// ============================================================
// ROOM IMAGE MAPPING
// ============================================================
//
// These images are stored locally in:
//
// public/images/
//
// This mapping makes sure the homepage uses the manual
// images instead of the old AI-generated image URLs.
//


const roomImages = {

    "Deluxe Room":
        "/images/deluxe-king-room.jpg",

    "Deluxe King Room":
        "/images/deluxe-king-room.jpg",

    "Executive Suite":
        "/images/executive-suite.jpg",

    "Presidential Suite":
        "/images/presidential-suite.jpg"

};


// ============================================================
// GET MANUAL ROOM IMAGE
// ============================================================

function getRoomImage(room) {

    // First try to match the room name
    if (room.name && roomImages[room.name]) {

        return roomImages[room.name];

    }


    // If the room name is slightly different,
    // check using lowercase text.

    const roomName =
        (room.name || "").toLowerCase();


    if (roomName.includes("deluxe")) {

        return "/images/deluxe-king-room.jpg";

    }


    if (roomName.includes("executive")) {

        return "/images/executive-suite.jpg";

    }


    if (roomName.includes("presidential")) {

        return "/images/presidential-suite.jpg";

    }


    // Final fallback

    return "/images/deluxe-king-room.jpg";

}



// ============================================================
// LOAD ROOMS FROM MONGODB
// ============================================================

async function loadRooms() {

    const roomGrid =
        document.getElementById("roomGrid");


    // Stop if the page doesn't contain roomGrid

    if (!roomGrid) {

        return;

    }


    try {

        // Show loading message

        roomGrid.innerHTML = `
            <div class="loading-card">
                Loading our rooms...
            </div>
        `;


        // Get rooms from the Express API

        const response =
            await fetch("/api/rooms");


        if (!response.ok) {

            throw new Error(
                `Rooms request failed with status ${response.status}`
            );

        }


        const data =
            await response.json();


        // Support either:
        //
        // [room, room, room]
        //
        // OR
        //
        // { rooms: [room, room, room] }

        const rooms =
            Array.isArray(data)
                ? data
                : data.rooms;


        if (!Array.isArray(rooms) || rooms.length === 0) {

            roomGrid.innerHTML = `
                <div class="loading-card">
                    No rooms are currently available.
                </div>
            `;

            return;

        }


        // Clear loading message

        roomGrid.innerHTML = "";


        // Create each room card

        rooms.forEach((room) => {


            // IMPORTANT:
            //
            // We intentionally use getRoomImage()
            // instead of room.image.
            //
            // This prevents old AI image URLs stored
            // in MongoDB from being used.

            const image =
                getRoomImage(room);


            const roomCard =
                document.createElement("article");


            roomCard.className =
                "room-card";


            roomCard.innerHTML = `

                <div class="room-image">

                    <img
                        src="${image}"
                        alt="${escapeHtml(room.name || "Hotel room")}"
                        loading="lazy"
                    >

                </div>


                <div class="room-content">

                    <div class="room-top">

                        <span class="room-capacity">
                            ${room.capacity || 2}
                            Guest${Number(room.capacity) === 1 ? "" : "s"}
                        </span>

                    </div>


                    <h3>
                        ${escapeHtml(room.name || "Luxury Room")}
                    </h3>


                    <p>
                        ${escapeHtml(
                            room.description ||
                            "Experience exceptional comfort and refined hospitality."
                        )}
                    </p>


                    <div class="room-bottom">

                        <div class="room-price">

                            <span>
                                From
                            </span>

                            <strong>
                                ₦${formatPrice(room.price)}
                            </strong>

                            <small>
                                / night
                            </small>

                        </div>


                        <a
                            href="/booking.html?room=${encodeURIComponent(room.name || "")}"
                            class="room-link"
                        >
                            View Room →
                        </a>

                    </div>

                </div>

            `;


            // Add card to page

            roomGrid.appendChild(roomCard);

        });


    } catch (error) {

        console.error(
            "Unable to load rooms:",
            error
        );


        roomGrid.innerHTML = `

            <div class="loading-card">

                <p>
                    We could not load our rooms right now.
                </p>

                <button
                    type="button"
                    onclick="loadRooms()"
                    class="button button-dark"
                >
                    Try Again
                </button>

            </div>

        `;

    }

}



// ============================================================
// FORMAT ROOM PRICE
// ============================================================

function formatPrice(price) {

    const numericPrice =
        Number(price);


    if (Number.isNaN(numericPrice)) {

        return "0";

    }


    return numericPrice.toLocaleString("en-NG");

}



// ============================================================
// ESCAPE HTML
// ============================================================
//
// This prevents room information stored in MongoDB from
// accidentally being interpreted as HTML.
//

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}



// ============================================================
// MOBILE MENU
// ============================================================

function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuButton"
        );


    const navigation =
        document.getElementById(
            "navigation"
        );


    if (!button || !navigation) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            navigation.classList.toggle(
                "open"
            );

            button.classList.toggle(
                "active"
            );

        }
    );


    // Close menu after clicking a link

    navigation
        .querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    navigation.classList.remove(
                        "open"
                    );

                    button.classList.remove(
                        "active"
                    );

                }
            );

        });

}



// ============================================================
// HEADER SCROLL EFFECT
// ============================================================

function setupHeaderScroll() {

    const header =
        document.getElementById(
            "siteHeader"
        );


    if (!header) {

        return;

    }


    function updateHeader() {

        if (window.scrollY > 50) {

            header.classList.add(
                "scrolled"
            );

        } else {

            header.classList.remove(
                "scrolled"
            );

        }

    }


    window.addEventListener(
        "scroll",
        updateHeader
    );


    updateHeader();

}



// ============================================================
// BOOKING DATE VALIDATION
// ============================================================

function setupBookingDates() {

    const checkIn =
        document.getElementById(
            "homeCheckIn"
        );


    const checkOut =
        document.getElementById(
            "homeCheckOut"
        );


    if (!checkIn || !checkOut) {

        return;

    }


    // Get today's date

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    const todayString =
        `${year}-${month}-${day}`;


    // Prevent past dates

    checkIn.min =
        todayString;


    checkOut.min =
        todayString;


    // When check-in changes

    checkIn.addEventListener(
        "change",
        () => {

            if (!checkIn.value) {

                return;

            }


            checkOut.min =
                checkIn.value;


            if (
                checkOut.value &&
                checkOut.value <= checkIn.value
            ) {

                checkOut.value = "";

            }

        }
    );

}



// ============================================================
// BOOKING BUTTON
// ============================================================

function setupBookingButton() {

    const bookingButton =
        document.querySelector(
            ".booking-search"
        );


    const checkIn =
        document.getElementById(
            "homeCheckIn"
        );


    const checkOut =
        document.getElementById(
            "homeCheckOut"
        );


    const guests =
        document.getElementById(
            "homeGuests"
        );


    if (
        !bookingButton ||
        !checkIn ||
        !checkOut ||
        !guests
    ) {

        return;

    }


    bookingButton.addEventListener(
        "click",
        function (event) {

            // If dates aren't selected,
            // allow the normal booking page
            // navigation.

            if (
                !checkIn.value ||
                !checkOut.value
            ) {

                return;

            }


            event.preventDefault();


            const params =
                new URLSearchParams({

                    checkIn:
                        checkIn.value,

                    checkOut:
                        checkOut.value,

                    guests:
                        guests.value

                });


            window.location.href =
                `/booking.html?${params.toString()}`;

        }
    );

}



// ============================================================
// IMAGE ERROR HANDLING
// ============================================================

function setupImageFallbacks() {

    document.addEventListener(
        "error",
        function (event) {

            const image =
                event.target;


            if (
                image.tagName !== "IMG"
            ) {

                return;

            }


            // Prevent an infinite loop

            if (
                image.dataset.fallbackApplied
            ) {

                return;

            }


            image.dataset.fallbackApplied =
                "true";


            // Use the appropriate local
            // image based on the alt text.

            const alt =
                (
                    image.alt || ""
                ).toLowerCase();


            if (
                alt.includes("executive")
            ) {

                image.src =
                    "/images/executive-suite.jpg";

                return;

            }


            if (
                alt.includes("presidential")
            ) {

                image.src =
                    "/images/presidential-suite.jpg";

                return;

            }


            if (
                alt.includes("deluxe") ||
                alt.includes("room")
            ) {

                image.src =
                    "/images/deluxe-king-room.jpg";

            }

        },
        true
    );

}



// ============================================================
// START WEBSITE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadRooms();

        setupMobileMenu();

        setupHeaderScroll();

        setupBookingDates();

        setupBookingButton();

        setupImageFallbacks();

    }
);