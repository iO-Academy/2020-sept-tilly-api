const jwt = require('jsonwebtoken');

function generateAccessToken(payload) {
    return jwt.sign(payload,
        'secret'
        // { expiresIn: '1800s'}
    );
}

function authenticateToken(token) {
    return jwt.verify(token, 'secret', (err, user) => {
        console.log(err)
        return user
    })
}

module.exports.generateToken = generateAccessToken;
module.exports.authenticateToken = authenticateToken;