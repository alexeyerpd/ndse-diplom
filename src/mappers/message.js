module.exports = function (message) {
    return {
        id: message._id,
        author: message.author,
        sentAt: message.sentAt,
        text: message.text,
        readAt: message.readAt,
    };
};
