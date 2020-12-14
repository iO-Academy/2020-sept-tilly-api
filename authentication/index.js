const jwt = require('jsonwebtoken');

let payload = {username: 'boop', hash: '45n23j4'}

function generateAccessToken() {
    return jwt.sign(payload,
        'secret',
        { expiresIn: '1800s'}
    );
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, 'secret', (err, user) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

module.exports.generateToken = generateAccessToken;
module.exports.authenticateToken = authenticateToken;