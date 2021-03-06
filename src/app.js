const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();

const bodyParser = require('koa-bodyparser');
const router = new Router();

// Firebase admin
const adminCredentials = require('../everywhe-re-firebase-adminsdk-0kb8d-31d063f8a1.json');
const firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(adminCredentials),
    databaseURL: 'https://everywhe-re.firebaseio.com'
});

const firestore = firebaseAdmin.firestore();


// Routes

router.get('/broadcast/auth', async (ctx, next) => {
    // Get parsed query string
    const query = ctx.request.query;

    console.log('/broadcast/auth - Query: ' + JSON.stringify(query));

    // Get stream key
    const streamKey = query.key;

    // Get user by it's stream key
    let broadcasters = await firestore.collection('broadcasters').where('streamKey', '==', streamKey).limit(1).get();

    broadcasters.forEach((broadcaster) => {
        // Invalid stream key
        if (!broadcaster || !broadcaster.exists) {
            ctx.status = 403;
            ctx.body = {
                status: 'invalid_credentials'
            };
            return;
        }

        broadcaster = broadcaster.data();

        // User is banned
        if (broadcaster.banned) {
            ctx.status = 403;
            ctx.body = {
                status: 'banned'
            };
            return;
        }

        // Invalid stream name
        if (query.name !== broadcaster.uid) {
            ctx.status = 403;
            ctx.body = {
                status: 'invalid_credentials'
            };
            return;
        }

        ctx.body = {
            status: 'success'
        };
        next();
    });
});


// Register middleware

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);