const { model, Schema } = require('mongoose');
const { normalizeChat, normalizeMessage } = require('../mappers');
const Message = require('./message');

// _id	ObjectId	да	да
// users	[ObjectId, ObjectId]	да	нет
// createdAt	Date	да	нет
// messages	Message[]	нет	нет

const chatSchema = new Schema({
    userCreator: {
        type: 'ObjectId',
        ref: 'User',
        required: true,
    },
    users: [
        {
            type: 'ObjectId',
            ref: 'User',
            required: true,
        },
    ],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    messages: [
        {
            type: 'ObjectId',
            ref: 'Message',
        },
    ],
});

const chatModel = model('Chat', chatSchema);

chatModel.findChat = async function findChat(users) {
    const chats = await this.find({ users: { $all: users } });
    return chats[0];
};

chatModel.findChatById = async function findChatById(id) {
    return await this.findById(id);
};

chatModel.getChatsByUserId = async function getChatsByUserId(userId) {
    const chats = await this.find({ users: { $in: [userId] } })
        .populate([
            {
                path: 'messages',
                select: '-__v',
                transform: normalizeMessage,
            },
            {
                path: 'users',
                select: 'name',
                transform: ({ name }, id) => {
                    return { name, id };
                },
            },
        ])
        .select('-__v -createdAt')

    return chats.map(normalizeChat);
};

chatModel.createChat = async function createChat({ author, receiver }) {
    const users = [author, receiver];
    const chats = await this.find({ users: { $all: users } });

    if (chats.length) {
        return chats[0];
    }

    const chat = await this.create({
        userCreator: author,
        users,
    });

    return chat;
};

// author, receiver, text
chatModel.sendMessage = async function sendMessage({ author, receiver, text }) {
    const users = [author, receiver];
    const chats = await this.find({ users: { $all: users } });

    let chat = chats[0];
    if (!chat) {
        chat = new this({ userCreator: author, users });
    }

    const message = await Message.create({ author, text, sentAt: new Date() });
    chat.messages.push(message._id);
    await chat.save();

    chat = await this.findById(chat._id)
        .populate([
            {
                path: 'messages',
                select: '-__v',
                transform: normalizeMessage,
            },
            {
                path: 'users',
                select: 'name',
                transform: ({ name }, id) => {
                    return { name, id };
                },
            },
        ])
        .select('-__v -createdAt');

    return normalizeChat(chat);
};

// id = chat id
chatModel.getHistory = async function getHistory(id) {
    const chat = await this.findById(id)
        .populate([
            {
                path: 'messages',
                select: '-__v',
                transform: normalizeMessage,
            },
            {
                path: 'users',
                select: 'name',
                transform: ({ name }, id) => {
                    return { name, id };
                },
            },
        ])
        .select('-__v -createdAt');

    return normalizeChat(chat);
};

module.exports = chatModel;
