const mongo = require('mongoose');
const Schema = mongo.Schema;

const lessonSchema = new Schema({
    lesson: String,
    userId: String
});

module.exports = mongo.model('Lesson', lessonSchema);