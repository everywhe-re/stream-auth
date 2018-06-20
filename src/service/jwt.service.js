const jwt = require('jsonwebtoken');
const config = require('../../config');

function createToken(user) {
    const payload = {
        user: user,
        timestamp: Date.now()
    };

    return jwt.sign(payload, config.auth.jwt.secret);
}

function verifyToken(token) {
    return jwt.verify(token, config.auth.jwt.secret);
}

module.exports.createToken = createToken;
module.exports.verifyToken = verifyToken;