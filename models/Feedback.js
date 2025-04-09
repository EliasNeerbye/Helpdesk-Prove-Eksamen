const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
    ticket: {
        type: Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);