module.exports = function(data) {
    return {
        id: data._id,
        shortTitle: data.shortTitle,
        description: data.description,
        images: data.images,
        user: {
            id: data.userId._id,
            name: data.userId.name,
            contactPhone: data.userId.contactPhone,
        },
        createdAt: data.createdAt,
        tags: data.tags,
    };
};
