const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user', '1st-line', '2nd-line'],
        default: 'user',
    },
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'Profile',
    },
},{timestamps: true});

module.exports = mongoose.model('User', UserSchema);