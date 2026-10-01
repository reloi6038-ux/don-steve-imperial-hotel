function requireAdmin(req, res, next) {

    if (req.session && req.session.admin) {

        return next();

    }


    // API request

    if (
        req.originalUrl.startsWith("/api/")
    ) {

        return res.status(401).json({

            success: false,

            message:
                "Administrator authentication required."

        });

    }


    // Browser request

    return res.redirect(
        "/admin/login.html"
    );

}


module.exports = requireAdmin;