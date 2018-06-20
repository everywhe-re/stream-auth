const Koa = require('koa');
const Router = require('koa-router');
const argon2 = require('argon2');
const db = require('./database/lowdb');
const streamKeyUtils = require('./util/streamkey.utils');
const jwtService = require('./service/jwt.service');

const app = new Koa();

const bodyParser = require('koa-bodyparser');
const router = new Router();


// Routes

router.post('/user/add', async (ctx, next) => {
    // Get request body
    const body = ctx.request.body;

    let user = db.getUserByEmail(body.email);

    // The email is already in use
    if (user) {
        ctx.status = 409;
        ctx.body = { status: 'credentials_in_use' };
        return;
    }

    user = db.getUserByUserName(body.userName);

    // The username is already in use
    if (user) {
        ctx.status = 409;
        ctx.body = { status: 'credentials_in_use' };
        return;
    }

    // Hash password
    const passwordHash = await argon2.hash(body.password);

    // Build user object
    user = {
        userName: body.userName,
        email: body.email,
        passwordHash: passwordHash,
        banned: false
    };

    // Generate stream key
    user.streamKey = streamKeyUtils.generateStreamKey(user);

    // Save user to database
    db.addUser(user);

    ctx.body = user;
    next();
});

router.post('/auth', async (ctx, next) => {
    // Get request body
    const body = ctx.request.body;

    // Get user by its email
    const user = db.getUserByEmail(body.email);

    // User not found
    if (!user) {
        ctx.status = 403;
        ctx.body = { status: 'invalid_credentials' };
        return;
    }

    // Verify password
    const passwordValid = await argon2.verify(user.passwordHash, body.password);

    // Invalid password
    if (!passwordValid) {
        ctx.status = 403;
        ctx.body = { status: 'invalid_credentials' };
        return;
    }

    // Sign JWT
    const token = jwtService.createToken(user);

    // Return signed token
    ctx.body = { token };
});

router.get('/broadcast/auth', async (ctx, next) => {
    // Get parsed query string
    const query = ctx.request.query;

    console.log('/broadcast/auth - Query: ' + JSON.stringify(query));

    // Get stream key
    const streamKey = query.key;

    // Get user by it's stream key
    const user = db.getUserByStreamKey(streamKey);

    // Invalid stream key
    if (!user) {
        ctx.status = 403;
        ctx.body = { status: 'invalid_stream_key' };
        return;
    }

    // User is banned
    if (user.banned) {
        ctx.status = 403;
        ctx.body = { status: 'banned' };
        return;
    }

    // Invalid stream name
    if (user.userName !== query.name) {
        ctx.status = 403;
        ctx.body = { status: 'invalid_stream_name' };
        return;
    }

    ctx.body = { status: 'success' };
    next();
});

router.get('/play/auth', async (ctx, next) => {
    // Get parsed query string
    const query = ctx.request.query;

    console.log('/play/auth - Query: ' + JSON.stringify(query));

    next();
});


// Register middleware

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);