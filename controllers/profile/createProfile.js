const Profile = require('../../models/Profile');
const User = require('../../models/User');

module.exports = async (req, res) => {
    const { firstName, lastName, phone, profession } = req.body;

    // Basic validation
    if (!firstName || !lastName || !phone) {
        return res.status(400).json({ message: 'First name, last name and phone are required' });
    }

    try {
        // Check if user already has a profile
        if (req.user.profile) {
            return res.status(400).json({ message: 'User already has a profile' });
        }

        // Create new profile
        const newProfile = new Profile({
            firstName,
            lastName,
            phone,
            profession: profession || null
        });

        await newProfile.save();

        // Update user with profile reference
        await User.findByIdAndUpdate(req.user._id, { 
            profile: newProfile._id 
        });

        return res.status(201).json({
            message: 'Profile created successfully',
            profile: newProfile
        });

    } catch (error) {
        console.error("Error creating profile.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}