/* =========================================================
   DON STEVE IMPERIAL HOTEL
   ADMIN DASHBOARD JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

let allBookings = [];

let filteredBookings = [];


/* =========================================================
   DOM ELEMENTS
========================================================= */

const totalReservations =
    document.getElementById("totalReservations");

const pendingReservations =
    document.getElementById("pendingReservations");

const confirmedReservations =
    document.getElementById("confirmedReservations");

const cancelledReservations =
    document.getElementById("cancelledReservations");

const reservationsTableBody =
    document.getElementById("reservationsTableBody");

const bookingSearch =
    document.getElementById("bookingSearch");

const statusFilter =
    document.getElementById("statusFilter");

const refreshBookings =
    document.getElementById("refreshBookings");

const adminSignout =
    document.getElementById("adminSignout");


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Don Steve admin dashboard initialized."
        );


        /*
         * Load reservations
         */

        loadBookings();


        /*
         * Load contact messages
         */

        loadContactMessages();


        /*
         * Setup search
         */

        if (bookingSearch) {

            bookingSearch.addEventListener(
                "input",
                function () {

                    filterBookings();

                }
            );

        }


        /*
         * Setup status filter
         */

        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                function () {

                    filterBookings();

                }
            );

        }


        /*
         * Refresh reservations
         */

        if (refreshBookings) {

            refreshBookings.addEventListener(
                "click",
                function () {

                    loadBookings();

                }
            );

        }


        /*
         * Refresh contact messages
         */

        const refreshContactMessages =
            document.getElementById(
                "refreshContactMessages"
            );


        if (refreshContactMessages) {

            refreshContactMessages.addEventListener(
                "click",
                function () {

                    loadContactMessages();

                }
            );

        }


        /*
         * Setup administrator logout
         */

        setupAdminLogout();

    }
);


/* =========================================================
   ADMIN LOGOUT
========================================================= */

function setupAdminLogout() {

    const signOutButton =
        document.getElementById(
            "adminSignout"
        );


    if (!signOutButton) {

        console.warn(
            "Admin sign-out button not found."
        );

        return;

    }


    signOutButton.addEventListener(
        "click",
        async function () {

            if (signOutButton.disabled) {

                return;

            }


            const confirmed =
                window.confirm(
                    "Are you sure you want to sign out?"
                );


            if (!confirmed) {

                return;

            }


            signOutButton.disabled = true;

            signOutButton.textContent =
                "Signing Out...";


            try {

                console.log(
                    "Sending administrator logout request..."
                );


                const response =
                    await fetch(
                        "/api/admin/logout",
                        {
                            method: "POST",

                            credentials:
                                "same-origin",

                            headers: {
                                "Accept":
                                    "application/json"
                            },

                            cache: "no-store"
                        }
                    );


                let result = null;


                try {

                    result =
                        await response.json();

                } catch (jsonError) {

                    console.warn(
                        "Logout response was not JSON."
                    );

                }


                console.log(
                    "Logout response:",
                    response.status
                );


                if (!response.ok) {

                    throw new Error(
                        result?.message ||
                        "Unable to sign out."
                    );

                }


                if (
                    result &&
                    result.success === false
                ) {

                    throw new Error(
                        result.message ||
                        "Unable to sign out."
                    );

                }


                console.log(
                    "Administrator logged out successfully."
                );


                /*
                 * Redirect to login page.
                 */

                window.location.href =
                    "/admin/login.html";


            } catch (error) {

                console.error(
                    "Admin logout error:",
                    error
                );


                signOutButton.disabled =
                    false;


                signOutButton.textContent =
                    "Sign Out";


                showNotification(
                    error.message ||
                    "Unable to sign out. Please try again.",
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   LOAD RESERVATIONS
========================================================= */

async function loadBookings() {

    showLoading();


    try {

        console.log(
            "Requesting: /api/bookings/admin"
        );


        const response =
            await fetch(
                "/api/bookings/admin",
                {
                    method: "GET",

                    credentials:
                        "same-origin",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        console.log(
            "Reservation API response:",
            response.status
        );


        /*
         * Administrator session expired.
         */

        if (response.status === 401) {

            showError(
                "Your administrator session has expired. Please sign in again."
            );


            setTimeout(
                function () {

                    window.location.href =
                        "/admin/login.html";

                },
                1500
            );


            return;

        }


        const data =
            await response.json();


        console.log(
            "Reservation data:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load reservations."
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Reservation request failed."
            );

        }


        allBookings =
            Array.isArray(data.bookings)
                ? data.bookings
                : [];


        /*
         * Sort newest reservations first.
         */

        allBookings.sort(
            function (a, b) {

                return (
                    new Date(
                        b.createdAt ||
                        b._id
                    ) -
                    new Date(
                        a.createdAt ||
                        a._id
                    )
                );

            }
        );


        console.log(
            "Reservations received:",
            allBookings.length
        );


        updateStatistics();

        filterBookings();


    } catch (error) {

        console.error(
            "Reservation loading error:",
            error
        );


        showError(
            error.message ||
            "Unable to load reservations."
        );

    }

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        allBookings.length;


    const pending =
        allBookings.filter(
            function (booking) {

                return (
                    normalizeStatus(
                        booking.status
                    ) === "pending"
                );

            }
        ).length;


    const confirmed =
        allBookings.filter(
            function (booking) {

                return (
                    normalizeStatus(
                        booking.status
                    ) === "confirmed"
                );

            }
        ).length;


    const cancelled =
        allBookings.filter(
            function (booking) {

                return (
                    normalizeStatus(
                        booking.status
                    ) === "cancelled"
                );

            }
        ).length;


    if (totalReservations) {

        totalReservations.textContent =
            total;

    }


    if (pendingReservations) {

        pendingReservations.textContent =
            pending;

    }


    if (confirmedReservations) {

        confirmedReservations.textContent =
            confirmed;

    }


    if (cancelledReservations) {

        cancelledReservations.textContent =
            cancelled;

    }


    console.log(
        "Dashboard statistics:",
        {
            total,
            pending,
            confirmed,
            cancelled
        }
    );

}


/* =========================================================
   FILTER RESERVATIONS
========================================================= */

function filterBookings() {

    const search =
        bookingSearch
            ? bookingSearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    filteredBookings =
        allBookings.filter(
            function (booking) {

                const guestName =
                    String(
                        booking.guestName ||
                        booking.name ||
                        ""
                    ).toLowerCase();


                const email =
                    String(
                        booking.email ||
                        ""
                    ).toLowerCase();


                const phone =
                    String(
                        booking.phone ||
                        ""
                    ).toLowerCase();


                const room =
                    String(
                        booking.room ||
                        booking.roomType ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    guestName.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search) ||
                    room.includes(search);


                const bookingStatus =
                    normalizeStatus(
                        booking.status
                    );


                const matchesStatus =
                    selectedStatus === "all" ||
                    bookingStatus ===
                        selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderBookings();

}


/* =========================================================
   RENDER RESERVATIONS
========================================================= */

function renderBookings() {

    if (!reservationsTableBody) {

        return;

    }


    if (
        filteredBookings.length === 0
    ) {

        reservationsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty-cell"
                >
                    <div class="empty-state">

                        <div class="empty-icon">
                            ◆
                        </div>

                        <h3>
                            No reservations found
                        </h3>

                        <p>
                            There are no reservations
                            matching your current search
                            or status filter.
                        </p>

                    </div>
                </td>
            </tr>
        `;

        return;

    }


    reservationsTableBody.innerHTML =
        filteredBookings
            .map(
                function (booking) {

                    return createBookingRow(
                        booking
                    );

                }
            )
            .join("");


    attachBookingActions();

}


/* =========================================================
   CREATE RESERVATION TABLE ROW
========================================================= */

function createBookingRow(
    booking
) {

    const id =
        String(
            booking._id ||
            booking.id ||
            ""
        );


    const guestName =
        booking.guestName ||
        booking.name ||
        "Guest";


    const email =
        booking.email ||
        "No email";


    const room =
        booking.room ||
        booking.roomType ||
        "Room not specified";


    const guests =
        Number(
            booking.guests ||
            1
        );


    const status =
        normalizeStatus(
            booking.status
        );


    const checkIn =
        formatDate(
            booking.checkIn
        );


    const checkOut =
        formatDate(
            booking.checkOut
        );


    const statusClass =
        getStatusClass(
            status
        );


    return `
        <tr>

            <td>

                <div class="guest-cell">

                    <strong>
                        ${escapeHtml(
                            guestName
                        )}
                    </strong>

                    <small>
                        ${escapeHtml(
                            email
                        )}
                    </small>

                </div>

            </td>


            <td>

                <div class="room-name">
                    ${escapeHtml(
                        room
                    )}
                </div>

            </td>


            <td>

                <div class="stay-cell">

                    <strong>
                        ${escapeHtml(
                            checkIn
                        )}
                    </strong>

                    <small>
                        Check-in
                    </small>

                    <strong>
                        ${escapeHtml(
                            checkOut
                        )}
                    </strong>

                    <small>
                        Check-out
                    </small>

                </div>

            </td>


            <td>

                <div class="guest-count">
                    ${guests}
                    ${guests === 1
                        ? "guest"
                        : "guests"
                    }
                </div>

            </td>


            <td>

                <span
                    class="
                        status-badge
                        ${statusClass}
                    "
                >
                    ${escapeHtml(
                        status
                    )}
                </span>

            </td>


            <td>

                <div
                    class="reservation-actions"
                >

                    <button
                        type="button"
                        class="
                            action-button
                            view-booking
                        "
                        data-action="view"
                        data-id="${escapeHtml(id)}"
                    >
                        View
                    </button>


                    ${
                        status !== "confirmed"
                            ? `
                                <button
                                    type="button"
                                    class="
                                        action-button
                                        confirm-booking
                                    "
                                    data-action="confirm"
                                    data-id="${escapeHtml(id)}"
                                >
                                    Confirm
                                </button>
                            `
                            : ""
                    }


                    ${
                        status !== "cancelled"
                            ? `
                                <button
                                    type="button"
                                    class="
                                        action-button
                                        cancel-booking
                                    "
                                    data-action="cancel"
                                    data-id="${escapeHtml(id)}"
                                >
                                    Cancel
                                </button>
                            `
                            : ""
                    }


                    <button
                        type="button"
                        class="
                            action-button
                            delete-booking
                        "
                        data-action="delete"
                        data-id="${escapeHtml(id)}"
                    >
                        Delete
                    </button>

                </div>

            </td>

        </tr>
    `;

}


/* =========================================================
   ATTACH RESERVATION ACTION EVENTS
========================================================= */

function attachBookingActions() {

    const buttons =
        document.querySelectorAll(
            "[data-action]"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const action =
                        button.dataset.action;


                    const id =
                        button.dataset.id;


                    if (!id) {

                        showNotification(
                            "Reservation ID is missing.",
                            "error"
                        );

                        return;

                    }


                    if (
                        action === "view"
                    ) {

                        viewBooking(id);

                    }


                    if (
                        action === "confirm"
                    ) {

                        updateBookingStatus(
                            id,
                            "confirmed"
                        );

                    }


                    if (
                        action === "cancel"
                    ) {

                        updateBookingStatus(
                            id,
                            "cancelled"
                        );

                    }


                    if (
                        action === "delete"
                    ) {

                        deleteBooking(id);

                    }

                }
            );

        }
    );

}


/* =========================================================
   UPDATE RESERVATION STATUS
========================================================= */

async function updateBookingStatus(
    id,
    status
) {

    const booking =
        findBookingById(id);


    if (!booking) {

        showNotification(
            "Reservation could not be found.",
            "error"
        );

        return;

    }


    const guestName =
        booking.guestName ||
        booking.name ||
        "this guest";


    const actionText =
        status === "confirmed"
            ? "confirm"
            : "cancel";


    const confirmed =
        window.confirm(
            `Are you sure you want to ${actionText} the reservation for ${guestName}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/bookings/admin/${encodeURIComponent(id)}`,
                {
                    method: "PATCH",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status
                    })
                }
            );


        const data =
            await response.json();


        if (response.status === 401) {

            showNotification(
                "Administrator authentication required.",
                "error"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "/admin/login.html";

                },
                1200
            );


            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update reservation."
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Reservation update failed."
            );

        }


        const index =
            allBookings.findIndex(
                function (item) {

                    return (
                        getBookingId(item) ===
                        id
                    );

                }
            );


        if (index !== -1) {

            allBookings[index].status =
                status;

        }


        updateStatistics();

        filterBookings();


        showNotification(
            `Reservation ${status}.`,
            "success"
        );


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        showNotification(
            error.message ||
            "Unable to update reservation.",
            "error"
        );

    }

}


/* =========================================================
   DELETE RESERVATION
========================================================= */

async function deleteBooking(
    id
) {

    const booking =
        findBookingById(id);


    if (!booking) {

        showNotification(
            "Reservation could not be found.",
            "error"
        );

        return;

    }


    const guestName =
        booking.guestName ||
        booking.name ||
        "this guest";


    const confirmed =
        window.confirm(
            `Delete the reservation for ${guestName}?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/bookings/admin/${encodeURIComponent(id)}`,
                {
                    method: "DELETE",

                    credentials:
                        "same-origin",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (response.status === 401) {

            showNotification(
                "Administrator authentication required.",
                "error"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "/admin/login.html";

                },
                1200
            );


            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete reservation."
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Reservation deletion failed."
            );

        }


        allBookings =
            allBookings.filter(
                function (item) {

                    return (
                        getBookingId(item) !==
                        id
                    );

                }
            );


        updateStatistics();

        filterBookings();


        showNotification(
            "Reservation deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete reservation error:",
            error
        );


        showNotification(
            error.message ||
            "Unable to delete reservation.",
            "error"
        );

    }

}


/* =========================================================
   VIEW RESERVATION
========================================================= */

function viewBooking(
    id
) {

    const booking =
        findBookingById(id);


    if (!booking) {

        showNotification(
            "Reservation could not be found.",
            "error"
        );

        return;

    }


    const guestName =
        booking.guestName ||
        booking.name ||
        "Guest";


    const email =
        booking.email ||
        "Not provided";


    const phone =
        booking.phone ||
        "Not provided";


    const country =
        booking.country ||
        "Not provided";


    const room =
        booking.room ||
        booking.roomType ||
        "Not specified";


    const checkIn =
        formatDate(
            booking.checkIn
        );


    const checkOut =
        formatDate(
            booking.checkOut
        );


    const guests =
        booking.guests ||
        1;


    const status =
        normalizeStatus(
            booking.status
        );


    const requests =
        booking.specialRequests ||
        booking.requests ||
        "No special requests were provided.";


    const initial =
        guestName
            .charAt(0)
            .toUpperCase();


    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "booking-modal-overlay";


    modal.innerHTML = `

        <div class="booking-modal">

            <button
                type="button"
                class="booking-modal-close"
                data-modal-close
                aria-label="Close"
            >
                ×
            </button>


            <div class="booking-modal-heading">

                <span>
                    RESERVATION DETAILS
                </span>

                <h2>
                    Guest reservation
                </h2>

            </div>


            <div
                class="booking-modal-guest"
            >

                <div class="guest-initial">
                    ${escapeHtml(
                        initial
                    )}
                </div>

                <div>

                    <h3>
                        ${escapeHtml(
                            guestName
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            email
                        )}
                    </p>

                </div>

            </div>


            <div
                class="booking-details-grid"
            >

                <div>

                    <span>
                        ROOM
                    </span>

                    <strong>
                        ${escapeHtml(
                            room
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        STATUS
                    </span>

                    <strong>
                        ${escapeHtml(
                            status
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        CHECK-IN
                    </span>

                    <strong>
                        ${escapeHtml(
                            checkIn
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        CHECK-OUT
                    </span>

                    <strong>
                        ${escapeHtml(
                            checkOut
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        GUESTS
                    </span>

                    <strong>
                        ${escapeHtml(
                            String(guests)
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        PHONE
                    </span>

                    <strong>
                        ${escapeHtml(
                            phone
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        COUNTRY
                    </span>

                    <strong>
                        ${escapeHtml(
                            country
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        RESERVATION ID
                    </span>

                    <strong>
                        ${escapeHtml(
                            id
                        )}
                    </strong>

                </div>

            </div>


            <div
                class="booking-request-box"
            >

                <span>
                    SPECIAL REQUESTS
                </span>

                <p>
                    ${escapeHtml(
                        requests
                    )}
                </p>

            </div>


            <div
                class="booking-modal-actions"
            >

                ${
                    status !== "confirmed"
                        ? `
                            <button
                                type="button"
                                class="
                                    modal-confirm-button
                                "
                                data-modal-action="confirm"
                            >
                                Confirm Reservation
                            </button>
                        `
                        : ""
                }


                ${
                    status !== "cancelled"
                        ? `
                            <button
                                type="button"
                                class="
                                    modal-cancel-button
                                "
                                data-modal-action="cancel"
                            >
                                Cancel Reservation
                            </button>
                        `
                        : ""
                }


                <button
                    type="button"
                    class="
                        modal-close-button
                    "
                    data-modal-close
                >
                    Close
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    /*
     * Close modal buttons.
     */

    modal
        .querySelectorAll(
            "[data-modal-close]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        modal.remove();

                    }
                );

            }
        );


    /*
     * Close when clicking outside modal.
     */

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modal
            ) {

                modal.remove();

            }

        }
    );


    /*
     * Confirm from modal.
     */

    const confirmButton =
        modal.querySelector(
            '[data-modal-action="confirm"]'
        );


    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            async function () {

                modal.remove();

                await updateBookingStatus(
                    id,
                    "confirmed"
                );

            }
        );

    }


    /*
     * Cancel from modal.
     */

    const cancelButton =
        modal.querySelector(
            '[data-modal-action="cancel"]'
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            async function () {

                modal.remove();

                await updateBookingStatus(
                    id,
                    "cancelled"
                );

            }
        );

    }

}


/* =========================================================
   FIND BOOKING
========================================================= */

function findBookingById(
    id
) {

    return allBookings.find(
        function (booking) {

            return (
                getBookingId(booking) ===
                String(id)
            );

        }
    );

}


/* =========================================================
   GET BOOKING ID
========================================================= */

function getBookingId(
    booking
) {

    return String(
        booking._id ||
        booking.id ||
        ""
    );

}


/* =========================================================
   NORMALIZE RESERVATION STATUS
========================================================= */

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            "pending"
        )
            .trim()
            .toLowerCase();


    if (
        value === "confirmed"
    ) {

        return "confirmed";

    }


    if (
        value === "cancelled" ||
        value === "canceled"
    ) {

        return "cancelled";

    }


    return "pending";

}


/* =========================================================
   RESERVATION STATUS CLASS
========================================================= */

function getStatusClass(
    status
) {

    if (
        status === "confirmed"
    ) {

        return "status-confirmed";

    }


    if (
        status === "cancelled"
    ) {

        return "status-cancelled";

    }


    return "status-pending";

}


/* =========================================================
   FORMAT RESERVATION DATE
========================================================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "—";

    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}


/* =========================================================
   LOADING STATE
========================================================= */

function showLoading() {

    if (!reservationsTableBody) {

        return;

    }


    reservationsTableBody.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="loading-cell"
            >

                <div
                    class="loading-state"
                >

                    <span
                        class="loading-spinner"
                    ></span>

                    Loading reservations...

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   ERROR STATE
========================================================= */

function showError(
    message
) {

    if (!reservationsTableBody) {

        return;

    }


    reservationsTableBody.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="error-cell"
            >

                <div
                    class="error-state"
                >

                    <strong>
                        Unable to load reservations
                    </strong>

                    <p>
                        ${escapeHtml(
                            message
                        )}
                    </p>

                    <button
                        type="button"
                        class="retry-button"
                        onclick="loadBookings()"
                    >
                        Try Again
                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   ADMIN NOTIFICATION
========================================================= */

function showNotification(
    message,
    type = "success"
) {

    const existing =
        document.querySelector(
            ".admin-notification"
        );


    if (existing) {

        existing.remove();

    }


    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        `admin-notification notification-${type}`;


    notification.innerHTML = `

        <div
            class="notification-icon"
        >
            ${type === "success"
                ? "✓"
                : "!"
            }
        </div>

        <div
            class="notification-message"
        >
            ${escapeHtml(
                message
            )}
        </div>

        <button
            type="button"
            class="notification-close"
            aria-label="Close notification"
        >
            ×
        </button>

    `;


    document.body.appendChild(
        notification
    );


    const closeButton =
        notification.querySelector(
            ".notification-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                notification.remove();

            }
        );

    }


    setTimeout(
        function () {

            if (
                notification.isConnected
            ) {

                notification.remove();

            }

        },
        4000
    );

}


/* =========================================================
   CONTACT MESSAGES
========================================================= */

async function loadContactMessages() {

    const container =
        document.getElementById(
            "contactMessagesList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `
        <div class="contact-loading">
            Loading contact messages...
        </div>
    `;


    try {

        console.log(
            "Requesting: /api/contact/admin"
        );


        const response =
            await fetch(
                "/api/contact/admin",
                {
                    method: "GET",

                    credentials:
                        "same-origin",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        /*
         * Administrator session expired.
         */

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            showNotification(
                "Administrator authentication required.",
                "error"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "/admin/login.html";

                },
                1200
            );


            return;

        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load contact messages."
            );

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Contact message request failed."
            );

        }


        const messages =
            Array.isArray(
                result.messages
            )
                ? result.messages
                : [];


        console.log(
            "Contact messages received:",
            messages.length
        );


        renderContactMessages(
            messages
        );


    } catch (error) {

        console.error(
            "Contact messages error:",
            error
        );


        container.innerHTML = `
            <div class="contact-empty">

                <div class="contact-empty-icon">
                    !
                </div>

                <h3>
                    Unable to load messages
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Please try again."
                    )}
                </p>

                <button
                    type="button"
                    class="contact-retry-button"
                    onclick="loadContactMessages()"
                >
                    Try Again
                </button>

            </div>
        `;

    }

}


/* =========================================================
   RENDER CONTACT MESSAGES
========================================================= */

function renderContactMessages(
    messages
) {

    const container =
        document.getElementById(
            "contactMessagesList"
        );


    if (!container) {

        return;

    }


    if (!messages.length) {

        container.innerHTML = `
            <div class="contact-empty">

                <div class="contact-empty-icon">
                    ✉
                </div>

                <h3>
                    No contact messages
                </h3>

                <p>
                    Customer enquiries will appear
                    here when they are submitted.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        messages
            .map(
                function (message) {

                    return createContactMessageCard(
                        message
                    );

                }
            )
            .join("");


    container
        .querySelectorAll(
            "[data-contact-action]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const action =
                            button.dataset.contactAction;


                        const id =
                            button.dataset.contactId;


                        if (!id) {

                            showNotification(
                                "Contact message ID is missing.",
                                "error"
                            );

                            return;

                        }


                        if (
                            action === "read"
                        ) {

                            updateContactMessageStatus(
                                id,
                                "read"
                            );

                        }


                        if (
                            action === "replied"
                        ) {

                            updateContactMessageStatus(
                                id,
                                "replied"
                            );

                        }


                        if (
                            action === "delete"
                        ) {

                            deleteContactMessage(
                                id
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================================
   CREATE CONTACT MESSAGE CARD
========================================================= */

function createContactMessageCard(
    message
) {

    const status =
        normalizeContactStatus(
            message.status
        );


    const createdDate =
        message.createdAt
            ? formatContactDate(
                message.createdAt
            )
            : "Unknown date";


    const statusClass =
        getContactStatusClass(
            status
        );


    const displayStatus =
        status
            .charAt(0)
            .toUpperCase() +
        status.slice(1);


    const messageId =
        message._id ||
        message.id ||
        "";


    let actions = "";


    /*
     * Mark unread message as read.
     */

    if (
        status === "unread"
    ) {

        actions += `
            <button
                type="button"
                class="
                    contact-action-button
                    contact-read-button
                "
                data-contact-action="read"
                data-contact-id="${escapeHtml(
                    messageId
                )}"
            >
                Mark Read
            </button>
        `;

    }


    /*
     * Mark message as replied.
     */

    if (
        status !== "replied"
    ) {

        actions += `
            <button
                type="button"
                class="
                    contact-action-button
                    contact-replied-button
                "
                data-contact-action="replied"
                data-contact-id="${escapeHtml(
                    messageId
                )}"
            >
                Mark Replied
            </button>
        `;

    }


    /*
     * Delete message.
     */

    actions += `
        <button
            type="button"
            class="
                contact-action-button
                contact-delete-button
            "
            data-contact-action="delete"
            data-contact-id="${escapeHtml(
                messageId
            )}"
        >
            Delete
        </button>
    `;


    return `
        <article class="contact-message-card">

            <div class="contact-message-top">

                <div class="contact-message-person">

                    <strong>
                        ${escapeHtml(
                            message.name ||
                            "Guest"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            message.email ||
                            "No email"
                        )}
                    </span>

                </div>


                <span
                    class="
                        contact-message-status
                        ${statusClass}
                    "
                >
                    ${escapeHtml(
                        displayStatus
                    )}
                </span>

            </div>


            <div class="contact-message-meta">

                <div class="contact-meta-item">

                    <span
                        class="contact-meta-label"
                    >
                        Phone
                    </span>

                    <span
                        class="contact-meta-value"
                    >
                        ${escapeHtml(
                            message.phone ||
                            "Not provided"
                        )}
                    </span>

                </div>


                <div class="contact-meta-item">

                    <span
                        class="contact-meta-label"
                    >
                        Date Received
                    </span>

                    <span
                        class="contact-meta-value"
                    >
                        ${escapeHtml(
                            createdDate
                        )}
                    </span>

                </div>

            </div>


            ${
                message.subject
                    ? `
                        <div
                            class="
                                contact-message-subject
                            "
                        >
                            Subject:
                            ${escapeHtml(
                                message.subject
                            )}
                        </div>
                    `
                    : ""
            }


            <div
                class="
                    contact-message-body
                "
            >
                ${escapeHtml(
                    message.message ||
                    "No message content."
                )}
            </div>


            <div
                class="
                    contact-message-actions
                "
            >
                ${actions}
            </div>

        </article>
    `;

}


/* =========================================================
   NORMALIZE CONTACT STATUS
========================================================= */

function normalizeContactStatus(
    status
) {

    const value =
        String(
            status ||
            "unread"
        )
            .trim()
            .toLowerCase();


    if (
        value === "read"
    ) {

        return "read";

    }


    if (
        value === "replied"
    ) {

        return "replied";

    }


    return "unread";

}


/* =========================================================
   CONTACT STATUS CLASS
========================================================= */

function getContactStatusClass(
    status
) {

    if (
        status === "replied"
    ) {

        return "contact-status-replied";

    }


    if (
        status === "read"
    ) {

        return "contact-status-read";

    }


    return "contact-status-unread";

}


/* =========================================================
   FORMAT CONTACT DATE
========================================================= */

function formatContactDate(
    dateValue
) {

    if (!dateValue) {

        return "—";

    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);

}


/* =========================================================
   UPDATE CONTACT MESSAGE STATUS
========================================================= */

async function updateContactMessageStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(
                `/api/contact/admin/${encodeURIComponent(id)}`,
                {
                    method: "PATCH",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status
                    })
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            showNotification(
                "Administrator authentication required.",
                "error"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "/admin/login.html";

                },
                1200
            );


            return;

        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to update message."
            );

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Contact message update failed."
            );

        }


        showNotification(
            `Message marked as ${status}.`,
            "success"
        );


        await loadContactMessages();


    } catch (error) {

        console.error(
            "Update contact message error:",
            error
        );


        showNotification(
            error.message ||
            "Unable to update message.",
            "error"
        );

    }

}


/* =========================================================
   DELETE CONTACT MESSAGE
========================================================= */

async function deleteContactMessage(
    id
) {

    const confirmed =
        window.confirm(
            "Delete this contact message?\n\nThis action cannot be undone."
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/contact/admin/${encodeURIComponent(id)}`,
                {
                    method: "DELETE",

                    credentials:
                        "same-origin",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            showNotification(
                "Administrator authentication required.",
                "error"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "/admin/login.html";

                },
                1200
            );


            return;

        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to delete message."
            );

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Contact message deletion failed."
            );

        }


        showNotification(
            "Contact message deleted successfully.",
            "success"
        );


        await loadContactMessages();


    } catch (error) {

        console.error(
            "Delete contact message error:",
            error
        );


        showNotification(
            error.message ||
            "Unable to delete message.",
            "error"
        );

    }

}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   EXPOSE FUNCTIONS FOR HTML
========================================================= */

window.loadBookings =
    loadBookings;


window.loadContactMessages =
    loadContactMessages;


window.setupAdminLogout =
    setupAdminLogout;