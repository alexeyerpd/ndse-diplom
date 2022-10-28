const express = require('express');
const { normalizeUser } = require('../../mappers');
const { User } = require('../../models');
const { sendJsonByStatus, getErrorText } = require('../../utils');

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { email, password, name, contactPhone } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user) {
            sendJsonByStatus(res, 'email занят', 422);
            return;
        }

        try {
            const user = await User.create({
                email,
                password,
                name,
                contactPhone,
            });
            sendJsonByStatus(res, user, 201);
        } catch (e) {
            sendJsonByStatus(res, getErrorText(e.errors), 400);
        }
    } catch (e) {
        sendJsonByStatus(res, null, 500);
    }
});

module.exports = router;
