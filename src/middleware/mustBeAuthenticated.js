const express = require('express');
const { sendJsonByStatus } = require('../utils');

const router = express.Router();

router.use((req, res, next) => {
    if (!req.isAuthenticated()) {
        return sendJsonByStatus(res, 'Пользователь не аутентифицирован', 401);
    }
    next();
});

module.exports = router;
