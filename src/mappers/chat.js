module.exports = function (chat) {
    return {
        id: chat._id,
        userCreator: chat.userCreator,
        users: chat.users,
        createdAt: chat.createdAt,
        messages: chat.messages,
    };
};
