const express = require('express');
const { normalizeUser } = require('../../mappers');
const { sendJsonByStatus } = require('../../utils');

const router = express.Router();

router.get('/user', (req, res, next) => {
    if (req.isAuthenticated()) {
        sendJsonByStatus(res, normalizeUser(req.user));
    } else {
        sendJsonByStatus(res, false);
    }
});

module.exports = router;
