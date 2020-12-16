const jwt = require('jsonwebtoken');

function generateAccessToken(payload) {
    return jwt.sign(payload,
        'secret',
        { expiresIn: '180s'}
    );
}

function generateRefreshToken(payload) {
    return jwt.sign(payload,
        'secret',
        { expiresIn: '86400s'}
    );
}

// function authenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization']
//     const token = authHeader && authHeader.split(' ')[1]
//     if (token == null) return res.sendStatus(401)
//     jwt.verify(token, 'secret', (err, user) => {
//         console.log(err)
//         if (err) return res.sendStatus(403)
//         req.user = user
//         next()
//     })
// }

function authenticateToken(token) {
    return jwt.verify(token, 'secret', (err, user) => {
        console.log(err)
        return user
    })
}

module.exports.generateAccessToken = generateAccessToken;
module.exports.generateRefreshToken = generateRefreshToken;
module.exports.authenticateToken = authenticateToken;