const ERROR_MESSAGES_DICT = {
    400: { status: 'error', message: 'Bad request' },
    401: { status: 'error', message: 'Unauthorized' },
    403: { status: 'error', message: 'Forbidden ' },
    404: { status: 'error', message: 'Not found' },
    422: { status: 'error', message: 'Такой пользователь уже существует' },
    500: { status: 'error', message: 'Internal server error' },
};

module.exports = {
    ERROR_MESSAGES_DICT,
};
