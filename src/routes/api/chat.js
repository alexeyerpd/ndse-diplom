const express = require('express');
const { normalizeChat } = require('../../mappers');
const Chat = require('../../models/chat');
const { sendJsonByStatus } = require('../../utils');
const router = express.Router();

router.post('/chats', async (req, res, next) => {
    const {receiver} = req.body;

    if (!receiver) {
        sendJsonByStatus(res, 'Должен быть передан собеседник', 400);
    }

    const chat = await Chat.createChat({ author: req.user, receiver });
    sendJsonByStatus(res, normalizeChat(chat))
})

router.get('/chats', async (req, res, next) => {
    const {_id: id} = req.user;

    const chats = await Chat.getChatsByUserId(id);
    sendJsonByStatus(res, chats)
})

module.exports = router;