const express = require('express');
const app = express();
const cors = require('cors');
const mongo = require("mongoose")
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { graphqlHTTP } = require('express-graphql');
const graphQLSchema = require('./schema')

app.use(cors({origin: '*'}));
app.options('*', cors({origin: '*'}));

mongo.connect('mongodb+srv://root:Pangolins4eva@cluster0.nyyqa.mongodb.net/til', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongo.connection.once('open', () => {
    console.log('connected to database');
})

app.use(
    '/graphql',
    graphqlHTTP(async (request, response, graphQLParams) => ({
        schema: graphQLSchema,
        graphiql: true,
    })),
);

app.listen(4000, () => {
    console.log('Server running successfully...')
})