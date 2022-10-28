const multer = require('multer');

const allowedImgTypes = ['image/png', 'image/jpg', 'image/jpeg'];

const filterDict = {
    images: allowedImgTypes,
};

const storage = multer.diskStorage({
    destination(req, file, cb) {
        if (allowedImgTypes.includes(file.mimetype)) {
            cb(null, 'public/img');
        }
    },
    filename(req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    const { fieldname, mimetype } = file;
    if (filterDict[fieldname]?.includes(mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

module.exports = multer({ storage, fileFilter });
