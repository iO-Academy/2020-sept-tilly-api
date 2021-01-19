const mongo = require('mongoose');
const Schema = mongo.Schema;

const notificationSchema = new Schema({
    recipientId: Object,
    senderId: Object,
    type: String,
    lessonId: Object,
    status: String
});

module.exports = mongo.model('Notification', notificationSchema);