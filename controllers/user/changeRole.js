const User = require('../../models/User');

module.exports = async (req, res) => {
    const { userId, role } = req.body;
    
    // Ensure admin role
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can change user roles' });
    }
    
    if (!userId || !role) {
        return res.status(400).json({ message: 'User ID and role are required' });
    }
    
    // Validate the role
    const validRoles = ['user', 'admin', '1st-line', '2nd-line'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }
    
    try {
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update the role
        user.role = role;
        await user.save();
        
        return res.status(200).json({
            message: 'User role updated successfully',
            user: {
                _id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error changing user role:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};