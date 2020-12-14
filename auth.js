const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const jwt = require('jsonwebtoken');
const unless = require('express-unless');
const expressjwt = require('express-jwt');
const graphQLSchema = require('./schema');


const jwtCheck = expressjwt({secret:'secret', algorithms:['HS256']})

const schema = buildSchema(`
  type Query {
    hostname: String
  }
`);

const root = {
    hostname(args, request) {
        return request.hostname;
    }
};

const verifyToken = (req, res, next) => {
    jwt.verify(req.headers.authorization,
        'secret',
        (err, decoded) => {
        if (err){
            return res.sendStatus(401);
        }
        next();
    });
}
verifyToken.unless = unless;

const app = express();
app.post('/auth', (req, res) => {
    const token = jwt.sign({ username: 'boop' }, 'secret');
    res.send(token);
})

// app.use(verifyToken.unless({ path: ['/auth'] }));


app.get('/loggedin', jwtCheck, (req,res) => {
    res.send('protected aka for logged in');
})

app.use('/graphql', graphqlHTTP({
    schema: graphQLSchema,
    graphiql: true,
}));
app.listen(4002, () => console.log('server started'));