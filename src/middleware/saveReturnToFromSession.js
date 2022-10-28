function saveReturnToFromSession(req, res, next) {
    if (req.session && req.session.returnTo) {
        req.returnTo = req.session.returnTo;
    }
    next();
}

module.exports = saveReturnToFromSession;
