const { sendJsonByStatus } = require('../utils');

module.exports = (err, req, res, next) => {
    console.error(err.stack);
    sendJsonByStatus(res, null, 500);
};
