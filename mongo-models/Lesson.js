const mongo = require('mongoose');
const Schema = mongo.Schema;

const lessonSchema = new Schema({
    lesson: String,
    userId: Object,
    likedBy: Array
});

module.exports = mongo.model('Lesson', lessonSchema);