const { sendJsonByStatus } = require("../utils");

module.exports = (req, res) => {
    sendJsonByStatus(res, null, 404);
};
