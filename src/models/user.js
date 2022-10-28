const crypto = require('crypto');
const { model, Schema } = require('mongoose');
const { normalizeUser } = require('../mappers');
const config = require('../config');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
    },
    contactPhone: String,
});

function generatePassword(salt, password) {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(
            password,
            salt,
            config.crypto.iterations,
            config.crypto.length,
            config.crypto.digest,
            (err, key) => {
                if (err) return reject(err);
                resolve(key.toString('hex'));
            },
        );
    });
}

function generateSalt() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(config.crypto.length, (err, buffer) => {
            if (err) return reject(err);
            resolve(buffer.toString('hex'));
        });
    });
}

userSchema.methods.setPassword = async function setPassword(password) {
    this.salt = await generateSalt();
    this.passwordHash = await generatePassword(this.salt, password);
};

userSchema.methods.checkPassword = async function (password) {
    if (!password) return false;

    const hash = await generatePassword(this.salt, password);
    return hash === this.passwordHash;
};

const userModel = model('User', userSchema);

userModel.presentCreate = userModel.create;
userModel.create = async function create({email, password, name, contactPhone}) {
    let user = await this.findOne({ email });

    if (user) {
        throw new Error('Пользователь с таким email уже существует');
    }

    user = new userModel({
        email,
        name,
        contactPhone,
    });

    await user.setPassword(password);
    await user.save()

    return normalizeUser(user);
};

userModel.findByEmail = async function findByEmail(email) {
    const user = await this.findOne({ email });

    if (!user) {
        return null;
    }

    return normalizeUser(user);
};

module.exports = userModel;
