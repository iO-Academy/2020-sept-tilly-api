const express = require('express');
const app = express();
const cors = require('cors');
const mongo = require("mongoose")
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { graphqlHTTP } = require('express-graphql');
const graphQLSchema = require('./schema');
const { buildSchema } = require('graphql');
const jwt = require('jsonwebtoken');


app.use(cors({origin: '*'}));
app.options('*', cors({origin: '*'}));

mongo.connect('mongodb+srv://root:Pangolins4eva@cluster0.nyyqa.mongodb.net/til', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongo.connection.once('open', () => {
    console.log('connected to database');
})

let payload = {username: 'boop', hash: '45n23j4'}

function generateAccessToken() {
    return jwt.sign(payload, 'secret', { expiresIn: '1800s' });
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

app.get('/auth', (req, res) => {
    const token = generateAccessToken()
    res.json(token)
})

app.use(authenticateToken);

app.use(
    '/graphql',
    graphqlHTTP(async (request, response, graphQLParams) => ({
        schema: graphQLSchema,
        graphiql: true,
    })),
);

app.listen(4002, () => {
    console.log('Server running successfully...')
})