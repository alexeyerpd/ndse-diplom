const fs = require('fs');
const path = require('path');
const { ERROR_MESSAGES_DICT } = require('./constants');

const getErrorResponse = (statusCode, message) => {
    if (!ERROR_MESSAGES_DICT[statusCode]) {
        return false;
    }
    if (message) {
        return { ...ERROR_MESSAGES_DICT[statusCode], message };
    }
    return ERROR_MESSAGES_DICT[statusCode];
};

function getResponseBody(data, statusCode) {
    return (
        getErrorResponse(statusCode, data) || {
            status: 'ok',
            ...(data !== undefined && { data }),
        }
    );
}

function sendJsonByStatus(response, data, statusCode = 200) {
    response.status(statusCode).json(getResponseBody(data, statusCode));
}

function getErrorText(error) {
    if (!error) {
        return 'Ошибка при создании';
    }
    const fields = Object.keys(error || {});
    return `${fields.length > 1 ? 'Fields' : 'Field'} '${fields.join(', ')}' ${
        fields.length > 1 ? 'are' : 'is'
    } required.`;
}

function deleteImgIfNotEmptyPath(req, filePath) {
    if (!filePath) return;

    try {
        fs.unlinkSync(path.join(req.rootPublicDir, filePath));
        return true;
    } catch (e) {
        throw new Error('failed to delete');
    }
}

function normalizeQueryParams(query) {
    return Object.entries(query).reduce((result, [k, val]) => {
        if (val.includes(',')) {
            result[k] = val.split(',');
        } else {
            result[k] = val;
        }
        return result;
    }, []);
}

const socketIOWrap = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);

class EventEmitter {
    constructor() {
        this.events = {}
    }

    subscribe(type, userId, fn) {
        if (!this.events[type]) {
            this.events[type] = {};
        }

        this.events[type][userId] = fn

        return () => {
            delete this.events[type][userId]
        }
    }

    emit(type, userId, ...args) {
        const event = this.events[type]?.[userId];
        if (event) {
            event(...args);
        }
    }
}

module.exports = {
    sendJsonByStatus,
    socketIOWrap,
    getErrorText,
    deleteImgIfNotEmptyPath,
    normalizeQueryParams,
    EventEmitter,
};
