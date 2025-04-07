const User = require('../../models/User');

module.exports = async (req, res) => {
    try {
        if (!req.user.profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Get user with populated profile and profession
        const user = await User.findById(req.user._id)
            .select('-password -__v')
            .populate({
                path: 'profile',
                populate: {
                    path: 'profession'
                }
            });

        return res.status(200).json({
            message: 'Profile retrieved successfully',
            profile: user.profile,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error retrieving profile.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}