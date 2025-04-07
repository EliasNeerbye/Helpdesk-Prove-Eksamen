const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    tickets: [{
        type: Schema.Types.ObjectId,
        ref: 'Ticket',
    }],
},{timestamps: true});

module.exports = mongoose.model('Organization', OrganizationSchema);