const { graphqlHTTP } = require('express-graphql');

const express = require('express');
const app = express();
const cors = require('cors');
const mongo = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(cors({origin: '*'}));
app.options('*', cors({origin: '*'}));
app.use('/graphiql', graphqlHTTP({ schema: require('./schema.js'), graphiql: true}));

mongo.connect('mongodb+srv://root:Pangolins4eva@cluster0.nyyqa.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongo.connection.once('open', () => {
    console.log('connected to database');
})




app.get('/', function(request, response) {
    return response.send("Set up");
})





app.listen(8080, () => {
    console.log('Server running successfully...')
})