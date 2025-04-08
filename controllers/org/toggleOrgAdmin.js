const User = require('../../models/User');
const Organization = require('../../models/Organization');

module.exports = async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    
    try {
        // Check if requesting user is a system admin
        const isSystemAdmin = req.user.role === 'admin';
        
        // Find the organization where the requesting user is a member
        const organization = await Organization.findOne({ 
            $or: [
                { admin: req.user._id },
                { orgAdmins: req.user._id }
            ]
        });
        
        if (!organization) {
            return res.status(404).json({ message: "You don't belong to any organization or are not an admin" });
        }
        
        // Check if the requesting user is the main admin or a system admin
        const isMainAdmin = organization.admin.toString() === req.user._id.toString();
        
        if (!isSystemAdmin && !isMainAdmin && !organization.orgAdmins.includes(req.user._id)) {
            return res.status(403).json({ message: "Only admins can manage admin permissions" });
        }
        
        // Check if target user exists in the same organization
        if (!organization.users.includes(userId)) {
            return res.status(404).json({ message: "User is not a member of your organization" });
        }
        
        // Prevent the main admin from being demoted
        if (organization.admin.toString() === userId) {
            return res.status(403).json({ message: "Cannot change admin status of the organization owner" });
        }
        
        // Check if user is already an org admin
        const isOrgAdmin = organization.orgAdmins.includes(userId);
        
        // Toggle the admin status
        if (isOrgAdmin) {
            // Remove from orgAdmins array (demote)
            organization.orgAdmins = organization.orgAdmins.filter(
                adminId => adminId.toString() !== userId
            );
        } else {
            // Add to orgAdmins array (promote)
            organization.orgAdmins.push(userId);
        }
        
        await organization.save();
        
        // Get updated user information
        const updatedUser = await User.findById(userId).select('-password');
        
        return res.status(200).json({
            message: isOrgAdmin ? 
                "User demoted from organization admin" : 
                "User promoted to organization admin",
            user: updatedUser,
            isOrgAdmin: !isOrgAdmin // The new status after toggle
        });
    } catch (error) {
        console.error("Error toggling organization admin status.\n\n", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}