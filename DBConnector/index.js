const mongo = require('mongoose');
module.exports = async function() {
    const connection = await mongo.connect('mongodb+srv://root:Pangolins4eva@cluster0.nyyqa.mongodb.net/til', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    return connection.db('til');
}

mongo.connection.once('open', () => {
    console.log('connected to database');
})

export default