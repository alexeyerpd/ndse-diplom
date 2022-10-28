const express = require('express');
const { sendJsonByStatus } = require('../../utils');

const router = express.Router();

router.get('/logout', (req, res, next) => {
    if (req.isAuthenticated()) {
        req.logOut({}, function (error) {
            if (error) {
                return sendJsonByStatus(res, false);
            }
            return sendJsonByStatus(res, true);
        });
    } else {
        sendJsonByStatus(res, false);
    }
});

module.exports = router;
