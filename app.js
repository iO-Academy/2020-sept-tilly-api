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
const unless = require('express-unless');
const expressjwt = require('express-jwt');

const jwtCheck = expressjwt({secret:'secret', algorithms:['HS256']})


app.use(cors({origin: '*'}));
app.options('*', cors({origin: '*'}));

mongo.connect('mongodb+srv://root:Pangolins4eva@cluster0.nyyqa.mongodb.net/til', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongo.connection.once('open', () => {
    console.log('connected to database');
})

// const verifyToken = (req, res, next) => {
//     jwt.verify(req.headers.authorization,
//         'secret',
//         (err, decoded) => {
//             if (err){
//                 return res.sendStatus(401);
//             }
//             next();
//         });
// }
// verifyToken.unless = unless;
// jwtCheck.unless = unless;

app.post('/auth', (req, res) => {
    const token = jwt.sign({ username: 'boop' }, 'secret');
    res.send(token);
})

// app.use(verifyToken.unless({ path: ['/auth'] }));
// app.use(expressjwt({ secret: 'secret'}).unless({path: ['/auth', '/']}));
app.get('/private', jwtCheck({secret: 'secret'}), (req, res) => {
    res.send('texthere');
})

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