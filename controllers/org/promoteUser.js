const User = require('../../models/User');
const Organization = require('../../models/Organization');

module.exports = async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    
    try {
        // Check if requesting user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can promote users" });
        }
        
        // Find the organization where the requesting admin is a member
        const adminOrg = await Organization.findOne({ users: req.user._id });
        if (!adminOrg) {
            return res.status(404).json({ message: "You don't belong to any organization" });
        }
        
        // Check if target user exists in the same organization
        if (!adminOrg.users.includes(userId)) {
            return res.status(404).json({ message: "User is not a member of your organization" });
        }
        
        // Promote the user to admin
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role: 'admin' },
            { new: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        return res.status(200).json({
            message: "User promoted to admin successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error promoting user to admin.\n\n", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}