module.exports = async (req, res) => {
    try {
        if (!req.user.profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        return res.status(200).json({
            message: 'Profile retrieved successfully',
            profile: req.user.profile,
            user: {
                id: req.user._id,
                email: req.user.email,
                role: req.user.role
            }
        });

    } catch (error) {
        console.error("Error retrieving profile.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}