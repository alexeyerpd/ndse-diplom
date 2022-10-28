const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../../models');

async function verify(email, password, done) {
    try {
        const user = await User.findOne({ email });
        console.log(user, ' user')
        if (!user) {
            return done({ message: 'Пользователь не найден' }, false);
        }
        const isCorrectPassword = await user.checkPassword(password);
        if (!isCorrectPassword) {
            console.log('inc pas')
            return done({ message: 'Не верный пароль' }, false);
        }
        return done(null, user);
    } catch (e) {
        done(e);
    }
}

const options = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: false,
};

function serializeUser(user, cb) {
    cb(null, user._id);
}

async function deserializeUser(id, cb) {
    try {
        const user = await User.findById(id, { name: 1, email: 1, contactPhone: 1 });

        if (!user) {
            return cb(null, false);
        }
        return cb(null, user);
    } catch (e) {
        cb(e);
    }
}

passport.use('local', new LocalStrategy(options, verify));
passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

module.exports = {
    initedPassport: passport,
};
