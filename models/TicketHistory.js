const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketHistorySchema = new Schema({
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
    action: {
        type: String,
        enum: ['created', 'updated', 'status_changed', 'priority_changed', 'commented', 'created_by_admin'],
        required: true
    },
    prevValue: {
        type: Schema.Types.Mixed
    },
    newValue: {
        type: Schema.Types.Mixed
    },
    meta: {
        type: Schema.Types.Mixed
    }
}, { timestamps: true });

module.exports = mongoose.model('TicketHistory', TicketHistorySchema);