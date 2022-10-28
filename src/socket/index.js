const socketIO = require('socket.io');
const { Chat } = require('../models');
const { EventEmitter } = require('../utils');

const event = new EventEmitter();

function socket(
    server,
    sessionMiddleware,
    initializeMiddleware,
    pasportSessionMiddleware,
) {
    const io = socketIO(server);

    io.use(sessionMiddleware);
    io.use(initializeMiddleware);
    io.use(pasportSessionMiddleware);

    io.use(async (socket, next) => {
        const query = socket.handshake.query;
        const user = socket.request.user;
        
        socket.data.user = user;
        socket.data.type = query.type;

        if (!user) return next(new Error('incorrect session, please relogin'));

        next();
    });

    io.on('connection', (socket) => {
        const { user, type } = socket.data;
        const userId = user._id.toString();

        let deleteEvent;

        if (type === 'chat') {
            deleteEvent = event.subscribe(type, userId, (chat) => {
                socket.emit('newMessage', chat);
            })
        } else {
            deleteEvent = event.subscribe(type, userId, async () => {
                const chats = await Chat.getChatsByUserId(userId);
                socket.emit('newChatsMessage', chats);
            })
        }

        socket.on('getHistory', async (chatId) => {
            const chat = await Chat.findChatById(chatId);
            const messages = await Chat.getHistory(chat._id)
            socket.emit('chatHistory', messages)
        });
        socket.on('sendMessage', async ({users, text}) => {
            const receiver = users.filter(id => id !== userId)[0]
            const chat = await Chat.sendMessage({author: userId, receiver, text});
            
            chat.users.forEach(user => {
                event.emit('chat', user.id, chat)
            })

            event.emit('chats', receiver)
        });

        socket.on('disconnect', () => {
            deleteEvent()
        });
    });

    return io;
}

module.exports = socket;