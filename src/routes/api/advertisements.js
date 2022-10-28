const express = require('express');
const { normalizeAdvertisement } = require('../../mappers');
const { mustBeAuthenticatedMiddleware } = require('../../middleware');
const fileMiddleware = require('../../middleware/file');
const { Advertisement } = require('../../models');
const {
    getErrorText,
    sendJsonByStatus,
    deleteImgIfNotEmptyPath,
    normalizeQueryParams,
} = require('../../utils');

const router = express.Router();

router.get('/advertisements/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const advertisement = await Advertisement
            .findById(req.params?.id)
            .populate('userId', ['id', 'name', 'contactPhone']);

        sendJsonByStatus(res, normalizeAdvertisement(advertisement));
    } catch (error) {
        sendJsonByStatus(res, `Объявления с таким id - ${id} не существует`, 400);
    }
});

// filters
//   shortTitle — поиск регулярным выражением;
//   description — поиск регулярным выражением;
//   userId — точное совпадение;
//   tags — значение в базе данных должно включать все искомые значения.
router.get('/advertisements', async (req, res, next) => {
    const params = normalizeQueryParams(req.query);

    try {
        const advertisements = await Advertisement.find(params);
        sendJsonByStatus(res, advertisements);
    } catch (error) {
        sendJsonByStatus(res, error, 400);
    }
});

router.post(
    '/advertisements',
    mustBeAuthenticatedMiddleware,
    fileMiddleware.fields([{ name: 'images' }]),
    async (req, res, next) => {
        try {
            const data = {
                images: (req.files.images || []).map((file) => file.path),
                userId: req.user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
                ...req.body,
            };
            const createdAdvertisement = await Advertisement.create(data);
            sendJsonByStatus(res, createdAdvertisement);
        } catch (error) {
            (req.files.images || []).forEach((file) => {
                deleteImgIfNotEmptyPath(req, file.path);
            });
            sendJsonByStatus(res, getErrorText(error.errors), 400);
        }
    },
);

router.delete(
    '/advertisements/:id',
    mustBeAuthenticatedMiddleware,
    async (req, res, next) => {
        const { id } = req.params;
        try {
            const advertisement = await Advertisement.findById(id);

            if (req.user.id !== advertisement.userId.toString()) {
                sendJsonByStatus(res, 'Можно удалять только свои объявления', 403);
                return;
            }

            const boundingDeleteImage = deleteImgIfNotEmptyPath.bind(null, req);
            advertisement.images.forEach(boundingDeleteImage);

            await advertisement.remove();

            sendJsonByStatus(res, true);
        } catch (error) {
            sendJsonByStatus(res, error.message || 'Ошибка при удалении', 400);
        }
    },
);

module.exports = router;
