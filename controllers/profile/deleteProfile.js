const Profile = require('../../models/Profile');
const User = require('../../models/User');
const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
    if (!req.user.profile) {
        return res.status(404).json({ message: 'Profile not found' });
    }

    try {
        const profile = await Profile.findById(req.user.profile);
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Delete profile picture if it exists
        if (profile.profilePicture) {
            try {
                await fs.unlink(path.join(__dirname, '../../uploads', profile.profilePicture));
            } catch (error) {
                console.error('Error deleting profile picture:', error);
            }
        }

        // Delete the profile
        await Profile.findByIdAndDelete(req.user.profile);

        // Remove profile reference from user
        await User.findByIdAndUpdate(req.user._id, {
            $unset: { profile: 1 }
        });

        return res.status(200).json({ 
            message: 'Profile deleted successfully' 
        });

    } catch (error) {
        console.error("Error deleting profile.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}