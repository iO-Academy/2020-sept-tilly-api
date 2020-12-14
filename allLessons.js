
const express = require('express');
const app = express();
const mongo = require("mongoose")
const cors = require('cors');


app.use(cors({origin: '*'}));
app.options('*', cors({origin: '*'}));

mongo.connect('mongodb+srv://root:Pangolins4eva@cluster0.nyyqa.mongodb.net/til', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongo.connection.once('open', () => {
    console.log(`connected to database on http://localhost:${port}`);
})


app.get('/viewall', (req, res) => {
    db.collection('lessons').find().toArray()
        .then(results => {
            res.send(results)
        })
})