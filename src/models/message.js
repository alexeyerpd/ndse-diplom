const { model, Schema } = require('mongoose');

const messageSchema = new Schema({
    author: {
        type: 'ObjectId',
        ref: 'User',
        required: true,
    },
    sentAt: {
        type: Date,
        required: true,
        default: new Date(),
    },
    text: {
        type: String,
        required: true,
    },
    readAt: Date,
});

module.exports = model('Message', messageSchema);;
