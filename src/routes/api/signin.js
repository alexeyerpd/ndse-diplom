const express = require('express');
const saveReturnToFromSession = require('../../middleware/saveReturnToFromSession');
const { initedPassport } = require('../../strategies/local');
const { sendJsonByStatus } = require('../../utils');

const router = express.Router();

router.post('/signin', saveReturnToFromSession, (req, res, next) => {
    initedPassport.authenticate('local', (error, user) => {
        if (error) {
            return sendJsonByStatus(res, error.message, 401);
        }

        req.logIn(user, function (error) {
            if (error) {
                return sendJsonByStatus(res, error, 401);
            }
            const data = {
                id: user._id,
                email: user.email,
                name: user.name,
                contactPhone: user.contactPhone,
            };
            return sendJsonByStatus(res, data);
        });
    })(req, res, next);
});

module.exports = router;
