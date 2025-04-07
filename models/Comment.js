const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ticket: {
        type: Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);