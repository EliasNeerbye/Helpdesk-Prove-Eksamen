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
        enum: ['admin', 'user'],
        default: 'user',
    },
    profile: {
        type: Schema.types.ObjectId,
        ref: 'Profile',
        unique: true,
    },
},{timestamps: true});

module.exports = mongoose.model('User', UserSchema);