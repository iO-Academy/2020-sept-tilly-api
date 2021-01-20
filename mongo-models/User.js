const mongo = require('mongoose');
const Schema = mongo.Schema;

const userSchema = new Schema({
    username: String,
    name: String,
    email: String,
    hash: String,
    description: String,
    following: Array,
    followers: Array,
    lessons: Array,
    likedLessons: Array,
    notifications: Array
});

module.exports = mongo.model('User', userSchema);
