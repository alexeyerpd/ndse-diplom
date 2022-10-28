module.exports = {
    errorMiddleware: require('./error'),
    notFoundMiddleware: require('./not-found'),
    fileMiddleware: require('./file'),
    mustBeAuthenticatedMiddleware: require('./mustBeAuthenticated'),
};
