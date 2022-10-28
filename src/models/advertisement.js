const { model, Schema } = require('mongoose');
const { normalizeAdvertisement } = require('../mappers');
const { normalizeQueryParams } = require('../utils');

const advertisementSchema = new Schema({
    shortTitle: {
        type: String,
        required: true,
    },
    userId: {
        type: 'ObjectId',
        ref: 'User',
    },
    createdAt: {
        type: Date,
        required: true,
    },
    updatedAt: {
        type: Date,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        required: true,
    },
    description: String,
    images: [String],
    tags: [String],
});

const advertisementModel = model('Advertisement', advertisementSchema);

advertisementModel.presentCreate = advertisementModel.create;
advertisementModel.create = async function create(data) {
    const createdAdvertisement = await this.presentCreate(data);
    const advertisement = await this.findById(createdAdvertisement._id).populate('userId', ['id', 'name']);
    return normalizeAdvertisement(advertisement);
}

advertisementModel.presentRemove = advertisementModel.remove;
advertisementModel.remove = async function remove(userId, id) {
    const advertisement = await this.findById(id);

    if (advertisement.userId.toString() !== userId) {
        throw new Error('Не ваше объявление')
    }

    if (advertisement.isDeleted) {
        throw new Error('Такого объявления не существует');
    }

    advertisement.isDeleted = true;
    await advertisement.save();
}

const filters = {
    shortTitle: '$regex',
    description: '$regex',
    userId: '_id',
    tags: '$all',
};

function createFilter(query) {
    return Object.keys(filters).reduce((res, k) => {
        if (k in query) {
            res[k] = { [filters[k]]: query[k] };
        }
        return res;
    }, {});
}

advertisementModel.presentFind = advertisementModel.find;
advertisementModel.find = async function find(params) {
    const normalizeParams = normalizeQueryParams(params);
    const filter = createFilter(normalizeParams)

    const advertisements = await this.presentFind({...filter, isDeleted: false}).populate(
        'userId',
        ['id', 'name', 'contactPhone'],
    );

    return advertisements.map(normalizeAdvertisement);
}

module.exports = advertisementModel;
