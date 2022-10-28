module.exports = function (user) {
    return {
        id: user._id,
        email: user.email,
        name: user.name,
        contactPhone: user.contactPhone,
    };
};
