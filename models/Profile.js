const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    phone: {
        type: String,
        unique: true,
    },
    profilePicture: {
        type: String,
    },
    profession: {
        type: Schema.Types.ObjectId,
        ref: 'Profession',
    }
});

module.exports = mongoose.model('Profile', ProfileSchema);