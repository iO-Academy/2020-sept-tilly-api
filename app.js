const express = require('express');
const app = express();
const cors = require('cors');
const mongo = require("mongoose")
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { graphqlHTTP } = require('express-graphql');
const graphQLSchema = require('./schema');
const { buildSchema } = require('graphql');
const port = 4002;
const authenticate = require('./authentication');

app.use(cors({origin: '*'}));
app.options('*', cors({origin: '*'}));

mongo.connect('mongodb+srv://root:Pangolins4eva@cluster0.nyyqa.mongodb.net/til', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongo.connection.once('open', () => {
    console.log(`connected to database on http://localhost:${port}`);
})

app.get('/auth', (req, res) => {
    const token = authenticate.generateToken()
    res.send(token)
})

app.use(
    '/graphql',
    graphqlHTTP(async (request, response, graphQLParams) => ({
        schema: graphQLSchema,
        graphiql: true,
    })),
);

app.listen(port, () => {
    console.log('Server running successfully...')
})