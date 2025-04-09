const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    summary: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed', 'canceled'],
        default: 'open',
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    assignedRole: {
        type: String,
        enum: ['1st-line', '2nd-line'],
    },
    screenshots: [{
        type: String,
    }],
},{timestamps: true});

module.exports = mongoose.model('Ticket', TicketSchema);