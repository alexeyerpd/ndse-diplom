const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const session = require('express-session');
const redisStorage = require('connect-redis')(session);
const redis = require('redis');

const { initedPassport } = require('./strategies/local');

const { errorMiddleware, notFoundMiddleware } = require('./middleware');

const socket = require('./socket');
const { socketIOWrap } = require('./utils');

const { signupRouter, signinRouter, advertisementsRouter, userRouter, logoutRouter, chatRouter } = require('./routes/api');


const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/delivery';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const client = redis.createClient({ legacyMode: true, url: REDIS_URL });
const app = express();

app.use('/', express.static(path.join(path.resolve(__dirname), '../front', '/build',)),)

app.use(express.json());
app.use(cookieParser());

const sessionMiddleware = session({
    store: new redisStorage({
        url: REDIS_URL,
        client,
    }),
    secret: process.env.COOKIE_SECRET || 'cookie-secret',
    resave: false,
    saveUninitialized: true,
});

app.use(sessionMiddleware);
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use((req, res, next) => {
    req.rootDir = path.join(path.resolve(__dirname));
    req.rootPublicDir = path.join(path.resolve(__dirname), '..');
    next();
});

const initializeMiddleware = initedPassport.initialize();
const pasportSessionMiddleware = initedPassport.session();

app.use(initializeMiddleware);
app.use(pasportSessionMiddleware);

// routes

app.use(
    '/public',
    express.static(path.join(path.resolve(__dirname), '..', '/public')),
);

app.use('/api', signupRouter);
app.use('/api', signinRouter);
app.use('/api', logoutRouter);
app.use('/api', userRouter);
app.use('/api', advertisementsRouter);
app.use('/api', chatRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

(async () => {
    try {
        await client.connect().catch(console.error);
        await mongoose.connect(MONGO_URL);
        const server = app.listen(PORT, () => {
            console.log(`Starting the server to http://localhost:${PORT}`);
        });
        socket(
            server,
            socketIOWrap(sessionMiddleware),
            socketIOWrap(initializeMiddleware),
            socketIOWrap(pasportSessionMiddleware),
        );
    } catch (e) {
        console.error(e);
    }
})();
