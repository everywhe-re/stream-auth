const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Set defaults
db.defaults({ users: [] })
    .write();
    

function getUserByUserName(userName) {
    return db.get('users')
            .find({ userName })
            .value();
}

function getUserByEmail(email) {
    return db.get('users')
            .find({ email })
            .value();
}

function getUserByStreamKey(streamKey) {
    return db.get('users')
            .find({ streamKey })
            .value();
}

function addUser(user) {
    db.get('users')
        .push(user)
        .write();
}

module.exports.getUserByUserName = getUserByUserName;
module.exports.getUserByEmail = getUserByEmail;
module.exports.getUserByStreamKey = getUserByStreamKey;
module.exports.addUser = addUser;