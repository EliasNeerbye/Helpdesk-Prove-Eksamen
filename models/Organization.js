// models/Organization.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        maxlength: 200,
    },
    // Main admin (creator)
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Additional org admins (can be promoted/demoted)
    orgAdmins: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    tickets: [{
        type: Schema.Types.ObjectId,
        ref: 'Ticket',
    }],
}, { timestamps: true });

module.exports = mongoose.model('Organization', OrganizationSchema);