"use strict";


/*
|--------------------------------------------------------------------------
| DON STEVE IMPERIAL HOTEL
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/


const ADMIN_TOKEN_KEY =
    "donSteveAdminToken";


let allBookings = [];

let filteredBookings = [];

let allContactMessages = [];

let selectedReservation = null;

let isLoadingBookings = false;

let isLoadingMessages = false;


/*
|--------------------------------------------------------------------------
| DOM HELPER
|--------------------------------------------------------------------------
*/

function $(id) {

    return document.getElementById(id);

}


/*
|--------------------------------------------------------------------------
| TOKEN
|--------------------------------------------------------------------------
*/

function getAdminToken() {

    try {

        return localStorage.getItem(
            ADMIN_TOKEN_KEY
        );

    } catch (error) {

        console.error(
            "Unable to read admin token:",
            error
        );

        return null;

    }

}


function removeAdminToken() {

    try {

        localStorage.removeItem(
            ADMIN_TOKEN_KEY
        );

    } catch (error) {

        console.error(
            "Unable to remove admin token:",
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| REDIRECT TO LOGIN
|--------------------------------------------------------------------------
*/

function redirectToLogin() {

    if (
        window.location.pathname ===
        "/admin/login.html"
    ) {

        return;

    }

    window.location.href =
        "/admin/login.html";

}


/*
|--------------------------------------------------------------------------
| AUTHENTICATED FETCH
|--------------------------------------------------------------------------
*/

async function authenticatedFetch(
    url,
    options = {}
) {

    const token =
        getAdminToken();


    if (!token) {

        redirectToLogin();

        throw new Error(
            "Admin authentication token is missing."
        );

    }


    const requestOptions = {
        ...options,

        headers: {
            ...(options.headers || {}),

            "Authorization":
                `Bearer ${token}`,

            "Content-Type":
                "application/json"
        }
    };


    let response;


    try {

        response =
            await fetch(
                url,
                requestOptions
            );

    } catch (error) {

        console.error(
            "Network error:",
            error
        );

        throw new Error(
            "Unable to connect to the server."
        );

    }


    if (
        response.status ===
        401
    ) {

        removeAdminToken();

        showToast(
            "Your login has expired. Please sign in again.",
            "error"
        );

        setTimeout(
            redirectToLogin,
            700
        );

        throw new Error(
            "Admin authentication expired."
        );

    }


    return response;

}


/*
|--------------------------------------------------------------------------
| AUTHENTICATION CHECK
|--------------------------------------------------------------------------
*/

async function checkAdminAuthentication() {

    if (!getAdminToken()) {

        redirectToLogin();

        return false;

    }


    try {

        const response =
            await authenticatedFetch(
                "/api/admin/me"
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            removeAdminToken();

            redirectToLogin();

            return false;

        }


        if (
            data.admin
        ) {

            const name =
                data.admin.name ||
                data.admin.username ||
                "Administrator";


            const role =
                data.admin.role ||
                "Hotel Management";


            const nameElement =
                $("administratorName");


            const roleElement =
                $("administratorRole");


            if (nameElement) {

                nameElement.textContent =
                    name;

            }


            if (roleElement) {

                roleElement.textContent =
                    role;

            }

        }


        return true;

    } catch (error) {

        console.error(
            "Authentication check failed:",
            error
        );

        return false;

    }

}


/*
|--------------------------------------------------------------------------
| SAFE TEXT
|--------------------------------------------------------------------------
*/

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

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


/*
|--------------------------------------------------------------------------
| DISPLAY VALUE
|--------------------------------------------------------------------------
*/

function displayValue(
    value,
    fallback = "—"
) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        return fallback;

    }


    return String(value);

}


/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/*
|--------------------------------------------------------------------------
| DATE AND TIME
|--------------------------------------------------------------------------
*/

function formatDateTime(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


/*
|--------------------------------------------------------------------------
| NORMALIZE BOOKING
|--------------------------------------------------------------------------
*/

function normalizeBooking(
    booking
) {

    return {

        ...booking,

        id:
            booking._id ||
            booking.id ||
            "",

        guestName:
            booking.guestName ||
            booking.name ||
            "",

        email:
            booking.email ||
            booking.guestEmail ||
            "",

        phone:
            booking.phone ||
            booking.phoneNumber ||
            booking.mobile ||
            "",

        guests:
            booking.guests ??
            booking.numberOfGuests ??
            booking.guestCount ??
            "",

        room:
            booking.room ||
            booking.roomName ||
            booking.roomType ||
            "",

        roomType:
            booking.roomType ||
            booking.room ||
            "",

        checkIn:
            booking.checkIn ||
            booking.checkin ||
            booking.arrivalDate ||
            "",

        checkOut:
            booking.checkOut ||
            booking.checkout ||
            booking.departureDate ||
            "",

        specialRequests:
            booking.specialRequests ||
            booking.requests ||
            booking.specialRequest ||
            "",

        status:
            booking.status ||
            "pending",

        createdAt:
            booking.createdAt ||
            booking.created_at ||
            booking.date ||
            ""

    };

}


/*
|--------------------------------------------------------------------------
| NORMALIZE CONTACT MESSAGE
|--------------------------------------------------------------------------
*/

function normalizeContactMessage(
    message
) {

    return {

        ...message,

        id:
            message._id ||
            message.id ||
            "",

        name:
            message.name ||
            message.fullName ||
            "",

        email:
            message.email ||
            "",

        phone:
            message.phone ||
            message.phoneNumber ||
            "",

        subject:
            message.subject ||
            message.title ||
            "",

        message:
            message.message ||
            message.body ||
            message.content ||
            "",

        status:
            message.status ||
            "unread",

        createdAt:
            message.createdAt ||
            message.created_at ||
            message.date ||
            ""

    };

}


/*
|--------------------------------------------------------------------------
| TOAST
|--------------------------------------------------------------------------
*/

function showToast(
    message,
    type = "info"
) {

    const container =
        $("toastContainer");


    if (!container) {

        return;

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(
        function () {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateX(15px)";

            toast.style.transition =
                "all 0.2s ease";


            setTimeout(
                function () {

                    toast.remove();

                },
                250
            );

        },
        3500
    );

}


/*
|--------------------------------------------------------------------------
| LOAD BOOKINGS
|--------------------------------------------------------------------------
*/

async function loadBookings() {

    if (isLoadingBookings) {

        return;

    }


    isLoadingBookings = true;


    const tableBody =
        $("reservationsTableBody");


    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="loading-cell"
                >
                    <div class="loading-state">
                        <span class="loading-spinner"></span>
                        <div>
                            Loading reservations...
                        </div>
                    </div>
                </td>
            </tr>
        `;

    }


    try {

        const response =
            await authenticatedFetch(
                "/api/bookings/admin"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load reservations."
            );

        }


        let bookings = [];


        if (
            Array.isArray(
                data.bookings
            )
        ) {

            bookings =
                data.bookings;

        } else if (
            Array.isArray(data)
        ) {

            bookings =
                data;

        } else if (
            data.data &&
            Array.isArray(data.data)
        ) {

            bookings =
                data.data;

        }


        allBookings =
            bookings.map(
                normalizeBooking
            );


        updateStatistics();

        applyBookingFilters();

    } catch (error) {

        console.error(
            "Load bookings error:",
            error
        );


        if (
            error.message !==
            "Admin authentication expired."
        ) {

            if (tableBody) {

                tableBody.innerHTML = `
                    <tr>
                        <td
                            colspan="7"
                            class="loading-cell"
                        >
                            <div class="empty-state">

                                <div class="empty-state-icon">
                                    ⚠
                                </div>

                                <h4>
                                    Unable to load reservations
                                </h4>

                                <p>
                                    ${escapeHtml(
                                        error.message
                                    )}
                                </p>

                            </div>
                        </td>
                    </tr>
                `;

            }


            showToast(
                error.message ||
                "Unable to load reservations.",
                "error"
            );

        }

    } finally {

        isLoadingBookings =
            false;

    }

}


/*
|--------------------------------------------------------------------------
| STATISTICS
|--------------------------------------------------------------------------
*/

function updateStatistics() {

    const total =
        allBookings.length;


    const pending =
        allBookings.filter(
            booking =>
                String(
                    booking.status
                ).toLowerCase() ===
                "pending"
        ).length;


    const confirmed =
        allBookings.filter(
            booking =>
                String(
                    booking.status
                ).toLowerCase() ===
                "confirmed"
        ).length;


    const cancelled =
        allBookings.filter(
            booking =>
                String(
                    booking.status
                ).toLowerCase() ===
                "cancelled"
        ).length;


    setText(
        "totalReservations",
        total
    );


    setText(
        "pendingReservations",
        pending
    );


    setText(
        "confirmedReservations",
        confirmed
    );


    setText(
        "cancelledReservations",
        cancelled
    );

}


/*
|--------------------------------------------------------------------------
| SET TEXT
|--------------------------------------------------------------------------
*/

function setText(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.textContent =
            displayValue(
                value,
                "0"
            );

    }

}


/*
|--------------------------------------------------------------------------
| FILTER BOOKINGS
|--------------------------------------------------------------------------
*/

function applyBookingFilters() {

    const searchInput =
        $("bookingSearch");


    const statusFilter =
        $("statusFilter");


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    filteredBookings =
        [...allBookings];


    if (search) {

        filteredBookings =
            filteredBookings.filter(
                booking => {

                    const text = [

                        booking.guestName,
                        booking.email,
                        booking.phone,
                        booking.room,
                        booking.roomType,
                        booking.status,
                        booking.checkIn,
                        booking.checkOut

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        search
                    );

                }
            );

    }


    if (
        selectedStatus &&
        selectedStatus !== "all"
    ) {

        filteredBookings =
            filteredBookings.filter(
                booking =>
                    String(
                        booking.status
                    ).toLowerCase() ===
                    selectedStatus.toLowerCase()
            );

    }


    renderBookings(
        filteredBookings
    );

}


/*
|--------------------------------------------------------------------------
| RENDER BOOKINGS
|--------------------------------------------------------------------------
*/

function renderBookings(
    bookings
) {

    const tableBody =
        $("reservationsTableBody");


    if (!tableBody) {

        return;

    }


    if (!bookings.length) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="loading-cell"
                >

                    <div class="empty-state">

                        <div class="empty-state-icon">
                            📋
                        </div>

                        <h4>
                            No reservations found
                        </h4>

                        <p>
                            No reservations match your search or filter.
                        </p>

                    </div>

                </td>
            </tr>
        `;

        return;

    }


    tableBody.innerHTML =
        bookings
            .map(
                createBookingRow
            )
            .join("");

}


/*
|--------------------------------------------------------------------------
| STATUS CLASS
|--------------------------------------------------------------------------
*/

function statusClass(
    status
) {

    switch (
        String(status).toLowerCase()
    ) {

        case "confirmed":
            return "status-confirmed";

        case "cancelled":
            return "status-cancelled";

        default:
            return "status-pending";

    }

}


/*
|--------------------------------------------------------------------------
| CREATE BOOKING ROW
|--------------------------------------------------------------------------
*/

function createBookingRow(
    booking
) {

    const status =
        String(
            booking.status ||
            "pending"
        ).toLowerCase();


    let actionButtons = "";


    /*
    |--------------------------------------------------------------------------
    | PENDING RESERVATION
    |--------------------------------------------------------------------------
    |
    | The administrator can approve it with ONE CLICK.
    |--------------------------------------------------------------------------
    */

    if (
        status === "pending"
    ) {

        actionButtons = `

            <button
                type="button"
                class="action-btn action-view"
                data-action="view"
                data-id="${escapeHtml(booking.id)}"
            >
                👁 View
            </button>


            <button
                type="button"
                class="action-btn approve-button"
                data-action="approve"
                data-id="${escapeHtml(booking.id)}"
            >
                ✓ Approve
            </button>


            <button
                type="button"
                class="action-btn cancel-button"
                data-action="cancel"
                data-id="${escapeHtml(booking.id)}"
            >
                × Cancel
            </button>


            <button
                type="button"
                class="action-btn delete-button"
                data-action="delete"
                data-id="${escapeHtml(booking.id)}"
            >
                🗑 Delete
            </button>

        `;

    } else {

        /*
        |--------------------------------------------------------------------------
        | ALREADY CONFIRMED OR CANCELLED
        |--------------------------------------------------------------------------
        */

        actionButtons = `

            <button
                type="button"
                class="action-btn action-view"
                data-action="view"
                data-id="${escapeHtml(booking.id)}"
            >
                👁 View
            </button>


            <button
                type="button"
                class="action-btn pending-button"
                data-action="pending"
                data-id="${escapeHtml(booking.id)}"
            >
                ↻ Pending
            </button>


            ${
                status === "confirmed"
                    ? `
                        <button
                            type="button"
                            class="action-btn cancel-button"
                            data-action="cancel"
                            data-id="${escapeHtml(booking.id)}"
                        >
                            × Cancel
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="action-btn approve-button"
                            data-action="approve"
                            data-id="${escapeHtml(booking.id)}"
                        >
                            ✓ Approve
                        </button>
                    `
            }


            <button
                type="button"
                class="action-btn delete-button"
                data-action="delete"
                data-id="${escapeHtml(booking.id)}"
            >
                🗑 Delete
            </button>

        `;

    }


    return `

        <tr
            data-booking-id="${escapeHtml(booking.id)}"
        >

            <td>

                <div class="guest-name">
                    ${escapeHtml(
                        displayValue(
                            booking.guestName
                        )
                    )}
                </div>

                <div class="guest-email">
                    ${escapeHtml(
                        displayValue(
                            booking.email
                        )
                    )}
                </div>

            </td>


            <td>

                <div class="room-name">
                    ${escapeHtml(
                        displayValue(
                            booking.room ||
                            booking.roomType
                        )
                    )}
                </div>

            </td>


            <td>
                ${escapeHtml(
                    displayValue(
                        booking.guests
                    )
                )}
            </td>


            <td class="date-text">

                ${escapeHtml(
                    formatDate(
                        booking.checkIn
                    )
                )}

            </td>


            <td class="date-text">

                ${escapeHtml(
                    formatDate(
                        booking.checkOut
                    )
                )}

            </td>


            <td>

                <span
                    class="status-badge ${statusClass(status)}"
                >
                    ${escapeHtml(status)}
                </span>

            </td>


            <td>

                <div class="action-buttons">

                    ${actionButtons}

                </div>

            </td>

        </tr>

    `;

}


/*
|--------------------------------------------------------------------------
| OPEN RESERVATION DETAILS
|--------------------------------------------------------------------------
*/

function openReservationDetails(
    bookingId
) {

    const booking =
        allBookings.find(
            item =>
                String(item.id) ===
                String(bookingId)
        );


    if (!booking) {

        showToast(
            "Reservation could not be found.",
            "error"
        );

        return;

    }


    selectedReservation =
        booking;


    setText(
        "detailGuestName",
        displayValue(
            booking.guestName
        )
    );


    setText(
        "detailGuestEmail",
        displayValue(
            booking.email
        )
    );


    setText(
        "detailGuestPhone",
        displayValue(
            booking.phone
        )
    );


    setText(
        "detailGuestCount",
        displayValue(
            booking.guests
        )
    );


    setText(
        "detailRoom",
        displayValue(
            booking.room
        )
    );


    setText(
        "detailRoomType",
        displayValue(
            booking.roomType
        )
    );


    setText(
        "detailCheckIn",
        formatDate(
            booking.checkIn
        )
    );


    setText(
        "detailCheckOut",
        formatDate(
            booking.checkOut
        )
    );


    setText(
        "detailReservationId",
        displayValue(
            booking.id
        )
    );


    setText(
        "detailCreatedAt",
        formatDateTime(
            booking.createdAt
        )
    );


    setText(
        "detailSpecialRequests",
        displayValue(
            booking.specialRequests,
            "No special requests."
        )
    );


    updateModalStatus();


    const modal =
        $("reservationModal");


    if (!modal) {

        showToast(
            "Reservation details window is not available.",
            "error"
        );

        return;

    }


    modal.classList.add(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/*
|--------------------------------------------------------------------------
| UPDATE MODAL STATUS
|--------------------------------------------------------------------------
*/

function updateModalStatus() {

    if (!selectedReservation) {

        return;

    }


    const statusElement =
        $("detailStatus");


    if (!statusElement) {

        return;

    }


    const status =
        String(
            selectedReservation.status ||
            "pending"
        ).toLowerCase();


    statusElement.innerHTML = `

        <span
            class="status-badge ${statusClass(status)}"
        >
            ${escapeHtml(status)}
        </span>

    `;

}


/*
|--------------------------------------------------------------------------
| CLOSE RESERVATION DETAILS
|--------------------------------------------------------------------------
*/

function closeReservationDetails() {

    const modal =
        $("reservationModal");


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );


    selectedReservation =
        null;

}


/*
|--------------------------------------------------------------------------
| CHANGE RESERVATION STATUS
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| There is NO typing anymore.
|
| The buttons call:
|
| approve -> confirmed
| pending -> pending
| cancel  -> cancelled
|
|--------------------------------------------------------------------------
*/

async function changeReservationStatus(
    bookingId,
    newStatus
) {

    const booking =
        allBookings.find(
            item =>
                String(item.id) ===
                String(bookingId)
        );


    if (!booking) {

        showToast(
            "Reservation could not be found.",
            "error"
        );

        return;

    }


    const validStatuses = [
        "pending",
        "confirmed",
        "cancelled"
    ];


    if (
        !validStatuses.includes(
            newStatus
        )
    ) {

        showToast(
            "Invalid reservation status.",
            "error"
        );

        return;

    }


    const statusNames = {

        pending:
            "pending",

        confirmed:
            "approved",

        cancelled:
            "cancelled"

    };


    const actionName =
        statusNames[
            newStatus
        ];


    const confirmed =
        window.confirm(
            `Are you sure you want to mark this reservation as ${actionName}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await authenticatedFetch(
                `/api/bookings/admin/${encodeURIComponent(bookingId)}`,
                {

                    method:
                        "PATCH",

                    body:
                        JSON.stringify({
                            status:
                                newStatus
                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update reservation."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Update local data
        |--------------------------------------------------------------------------
        */

        booking.status =
            newStatus;


        if (
            selectedReservation &&
            String(
                selectedReservation.id
            ) ===
            String(bookingId)
        ) {

            selectedReservation.status =
                newStatus;

        }


        updateStatistics();

        applyBookingFilters();

        updateModalStatus();


        showToast(
            `Reservation ${actionName} successfully.`,
            "success"
        );


    } catch (error) {

        console.error(
            "Status update failed:",
            error
        );


        if (
            error.message !==
            "Admin authentication expired."
        ) {

            showToast(
                error.message ||
                "Unable to update reservation.",
                "error"
            );

        }

    }

}


/*
|--------------------------------------------------------------------------
| DELETE RESERVATION
|--------------------------------------------------------------------------
*/

async function deleteReservation(
    bookingId
) {

    const booking =
        allBookings.find(
            item =>
                String(item.id) ===
                String(bookingId)
        );


    if (!booking) {

        showToast(
            "Reservation could not be found.",
            "error"
        );

        return;

    }


    const confirmed =
        window.confirm(
            `Delete the reservation for ${booking.guestName || "this guest"}?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await authenticatedFetch(
                `/api/bookings/admin/${encodeURIComponent(bookingId)}`,
                {
                    method:
                        "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete reservation."
            );

        }


        allBookings =
            allBookings.filter(
                item =>
                    String(item.id) !==
                    String(bookingId)
            );


        if (
            selectedReservation &&
            String(
                selectedReservation.id
            ) ===
            String(bookingId)
        ) {

            closeReservationDetails();

        }


        updateStatistics();

        applyBookingFilters();


        showToast(
            "Reservation deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete reservation error:",
            error
        );


        if (
            error.message !==
            "Admin authentication expired."
        ) {

            showToast(
                error.message ||
                "Unable to delete reservation.",
                "error"
            );

        }

    }

}


/*
|--------------------------------------------------------------------------
| LOAD CONTACT MESSAGES
|--------------------------------------------------------------------------
*/

async function loadContactMessages() {

    if (isLoadingMessages) {

        return;

    }


    isLoadingMessages =
        true;


    const container =
        $("contactMessagesList");


    try {

        const response =
            await authenticatedFetch(
                "/api/contact/admin"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load contact messages."
            );

        }


        let messages = [];


        if (
            Array.isArray(
                data.messages
            )
        ) {

            messages =
                data.messages;

        } else if (
            Array.isArray(data)
        ) {

            messages =
                data;

        } else if (
            data.data &&
            Array.isArray(data.data)
        ) {

            messages =
                data.data;

        }


        allContactMessages =
            messages.map(
                normalizeContactMessage
            );


        renderContactMessages();


    } catch (error) {

        console.error(
            "Contact messages error:",
            error
        );


        if (container) {

            container.innerHTML = `

                <div class="empty-state">

                    <div class="empty-state-icon">
                        ⚠
                    </div>

                    <h4>
                        Unable to load messages
                    </h4>

                    <p>
                        ${escapeHtml(
                            error.message
                        )}
                    </p>

                </div>

            `;

        }


        if (
            error.message !==
            "Admin authentication expired."
        ) {

            showToast(
                error.message ||
                "Unable to load messages.",
                "error"
            );

        }

    } finally {

        isLoadingMessages =
            false;

    }

}


/*
|--------------------------------------------------------------------------
| RENDER CONTACT MESSAGES
|--------------------------------------------------------------------------
*/

function renderContactMessages() {

    const container =
        $("contactMessagesList");


    if (!container) {

        return;

    }


    if (
        !allContactMessages.length
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    ✉
                </div>

                <h4>
                    No contact messages
                </h4>

                <p>
                    There are currently no messages from website visitors.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        allContactMessages
            .map(
                createMessageCard
            )
            .join("");

}


/*
|--------------------------------------------------------------------------
| CREATE MESSAGE CARD
|--------------------------------------------------------------------------
*/

function createMessageCard(
    message
) {

    const status =
        String(
            message.status ||
            "unread"
        ).toLowerCase();


    let badgeClass =
        "status-pending";


    if (
        status === "read" ||
        status === "replied"
    ) {

        badgeClass =
            "status-confirmed";

    }


    return `

        <article
            class="message-card"
        >

            <div class="message-header">

                <div>

                    <div class="message-name">
                        ${escapeHtml(
                            displayValue(
                                message.name
                            )
                        )}
                    </div>

                    <div class="message-email">
                        ${escapeHtml(
                            displayValue(
                                message.email
                            )
                        )}
                    </div>

                </div>


                <div class="message-date">

                    ${escapeHtml(
                        formatDateTime(
                            message.createdAt
                        )
                    )}

                </div>

            </div>


            <div class="message-subject">

                ${escapeHtml(
                    displayValue(
                        message.subject,
                        "No subject"
                    )
                )}

            </div>


            <div class="message-body">

                ${escapeHtml(
                    displayValue(
                        message.message,
                        "No message content."
                    )
                )}

            </div>


            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:10px;
                    margin-top:16px;
                    flex-wrap:wrap;
                "
            >

                <span
                    class="status-badge ${badgeClass}"
                >
                    ${escapeHtml(status)}
                </span>


                <div
                    style="
                        display:flex;
                        gap:7px;
                        flex-wrap:wrap;
                    "
                >

                    <button
                        type="button"
                        class="action-btn"
                        data-message-action="read"
                        data-message-id="${escapeHtml(message.id)}"
                    >
                        ✓ Mark Read
                    </button>


                    <button
                        type="button"
                        class="action-btn"
                        data-message-action="replied"
                        data-message-id="${escapeHtml(message.id)}"
                    >
                        ↗ Replied
                    </button>


                    <button
                        type="button"
                        class="action-btn delete-button"
                        data-message-action="delete"
                        data-message-id="${escapeHtml(message.id)}"
                    >
                        🗑 Delete
                    </button>

                </div>

            </div>

        </article>

    `;

}


/*
|--------------------------------------------------------------------------
| UPDATE CONTACT STATUS
|--------------------------------------------------------------------------
*/

async function updateContactMessageStatus(
    messageId,
    status
) {

    try {

        const response =
            await authenticatedFetch(
                `/api/contact/admin/${encodeURIComponent(messageId)}`,
                {

                    method:
                        "PATCH",

                    body:
                        JSON.stringify({
                            status:
                                status
                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update message."
            );

        }


        const message =
            allContactMessages.find(
                item =>
                    String(item.id) ===
                    String(messageId)
            );


        if (message) {

            message.status =
                status;

        }


        renderContactMessages();


        showToast(
            "Message status updated.",
            "success"
        );


    } catch (error) {

        console.error(
            "Message status error:",
            error
        );


        if (
            error.message !==
            "Admin authentication expired."
        ) {

            showToast(
                error.message ||
                "Unable to update message.",
                "error"
            );

        }

    }

}


/*
|--------------------------------------------------------------------------
| DELETE CONTACT MESSAGE
|--------------------------------------------------------------------------
*/

async function deleteContactMessage(
    messageId
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
            await authenticatedFetch(
                `/api/contact/admin/${encodeURIComponent(messageId)}`,
                {
                    method:
                        "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete message."
            );

        }


        allContactMessages =
            allContactMessages.filter(
                message =>
                    String(message.id) !==
                    String(messageId)
            );


        renderContactMessages();


        showToast(
            "Contact message deleted.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete message error:",
            error
        );


        if (
            error.message !==
            "Admin authentication expired."
        ) {

            showToast(
                error.message ||
                "Unable to delete message.",
                "error"
            );

        }

    }

}


/*
|--------------------------------------------------------------------------
| RESERVATION TABLE EVENTS
|--------------------------------------------------------------------------
*/

function setupReservationEvents() {

    const table =
        $("reservationsTableBody");


    if (!table) {

        return;

    }


    table.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.action;


            const id =
                button.dataset.id;


            if (!id) {

                return;

            }


            if (
                action === "view"
            ) {

                openReservationDetails(
                    id
                );

                return;

            }


            if (
                action === "approve"
            ) {

                await changeReservationStatus(
                    id,
                    "confirmed"
                );

                return;

            }


            if (
                action === "cancel"
            ) {

                await changeReservationStatus(
                    id,
                    "cancelled"
                );

                return;

            }


            if (
                action === "pending"
            ) {

                await changeReservationStatus(
                    id,
                    "pending"
                );

                return;

            }


            if (
                action === "delete"
            ) {

                await deleteReservation(
                    id
                );

                return;

            }

        }
    );

}


/*
|--------------------------------------------------------------------------
| CONTACT EVENTS
|--------------------------------------------------------------------------
*/

function setupContactEvents() {

    const container =
        $("contactMessagesList");


    if (!container) {

        return;

    }


    container.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    "button[data-message-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.messageAction;


            const id =
                button.dataset.messageId;


            if (
                action === "read"
            ) {

                await updateContactMessageStatus(
                    id,
                    "read"
                );

            }


            if (
                action === "replied"
            ) {

                await updateContactMessageStatus(
                    id,
                    "replied"
                );

            }


            if (
                action === "delete"
            ) {

                await deleteContactMessage(
                    id
                );

            }

        }
    );

}


/*
|--------------------------------------------------------------------------
| MODAL EVENTS
|--------------------------------------------------------------------------
*/

function setupModalEvents() {

    const modal =
        $("reservationModal");


    const backdrop =
        $("reservationModalBackdrop");


    const closeButton =
        $("closeReservationModal");


    const footerButton =
        $("closeReservationModalFooter");


    const approveButton =
        $("modalApproveReservation");


    const pendingButton =
        $("modalPendingReservation");


    const cancelButton =
        $("modalCancelReservation");


    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeReservationDetails
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeReservationDetails
        );

    }


    if (footerButton) {

        footerButton.addEventListener(
            "click",
            closeReservationDetails
        );

    }


    /*
    |--------------------------------------------------------------------------
    | ONE CLICK APPROVE
    |--------------------------------------------------------------------------
    */

    if (approveButton) {

        approveButton.addEventListener(
            "click",
            async function () {

                if (!selectedReservation) {

                    return;

                }


                await changeReservationStatus(
                    selectedReservation.id,
                    "confirmed"
                );

            }
        );

    }


    /*
    |--------------------------------------------------------------------------
    | ONE CLICK PENDING
    |--------------------------------------------------------------------------
    */

    if (pendingButton) {

        pendingButton.addEventListener(
            "click",
            async function () {

                if (!selectedReservation) {

                    return;

                }


                await changeReservationStatus(
                    selectedReservation.id,
                    "pending"
                );

            }
        );

    }


    /*
    |--------------------------------------------------------------------------
    | ONE CLICK CANCEL
    |--------------------------------------------------------------------------
    */

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            async function () {

                if (!selectedReservation) {

                    return;

                }


                await changeReservationStatus(
                    selectedReservation.id,
                    "cancelled"
                );

            }
        );

    }

}


/*
|--------------------------------------------------------------------------
| SEARCH
|--------------------------------------------------------------------------
*/

function setupSearch() {

    const input =
        $("bookingSearch");


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        applyBookingFilters
    );

}


/*
|--------------------------------------------------------------------------
| FILTER
|--------------------------------------------------------------------------
*/

function setupFilter() {

    const filter =
        $("statusFilter");


    if (!filter) {

        return;

    }


    filter.addEventListener(
        "change",
        applyBookingFilters
    );

}


/*
|--------------------------------------------------------------------------
| REFRESH BUTTONS
|--------------------------------------------------------------------------
*/

function setupRefreshButtons() {

    const bookingButton =
        $("refreshBookings");


    const messageButton =
        $("refreshContactMessages");


    if (bookingButton) {

        bookingButton.addEventListener(
            "click",
            async function () {

                await loadBookings();

                showToast(
                    "Reservations refreshed.",
                    "success"
                );

            }
        );

    }


    if (messageButton) {

        messageButton.addEventListener(
            "click",
            async function () {

                await loadContactMessages();

                showToast(
                    "Messages refreshed.",
                    "success"
                );

            }
        );

    }

}


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

function setupLogout() {

    const button =
        $("adminSignout");


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        async function () {

            const confirmed =
                window.confirm(
                    "Are you sure you want to sign out?"
                );


            if (!confirmed) {

                return;

            }


            const token =
                getAdminToken();


            try {

                if (token) {

                    await fetch(
                        "/api/admin/logout",
                        {

                            method:
                                "POST",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"

                            }

                        }
                    );

                }

            } catch (error) {

                console.warn(
                    "Logout request failed:",
                    error
                );

            } finally {

                removeAdminToken();

                window.location.href =
                    "/admin/login.html";

            }

        }
    );

}


/*
|--------------------------------------------------------------------------
| ESCAPE KEY
|--------------------------------------------------------------------------
*/

function setupKeyboardEvents() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                if (
                    $("reservationModal") &&
                    $("reservationModal")
                        .classList
                        .contains("open")
                ) {

                    closeReservationDetails();

                }

            }

        }
    );

}


/*
|--------------------------------------------------------------------------
| INITIALIZE
|--------------------------------------------------------------------------
*/

async function initializeDashboard() {

    const authenticated =
        await checkAdminAuthentication();


    if (!authenticated) {

        return;

    }


    setupReservationEvents();

    setupContactEvents();

    setupModalEvents();

    setupSearch();

    setupFilter();

    setupRefreshButtons();

    setupLogout();

    setupKeyboardEvents();


    await Promise.all(
        [
            loadBookings(),
            loadContactMessages()
        ]
    );

}


/*
|--------------------------------------------------------------------------
| START
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);