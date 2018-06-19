const crypto = require('crypto');

function generateStreamKey(user) {
    const data = {
        userName: user.userName,
        email: user.email,
        passwordHash: user.passwordHash,
        timestamp: Date.now()
    };
    
    const sha = crypto.createHash('sha512').update(JSON.stringify(data));

    return sha.digest('hex');
}

module.exports.generateStreamKey = generateStreamKey;