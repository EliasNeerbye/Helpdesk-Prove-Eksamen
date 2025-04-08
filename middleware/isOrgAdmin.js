module.exports = async (req, res, next) => {
    try {
        const Organization = require('../models/Organization');
        
        // Check if user is a system admin (always allowed)
        if (req.user.role === 'admin') {
            return next();
        }
        
        // Check if user is an organization admin
        const organization = await Organization.findOne({
            $or: [
                { admin: req.user._id },
                { orgAdmins: req.user._id }
            ]
        });
        
        if (organization) {
            return next();
        }
        
        return res.status(403).json({ message: "You must be an organization admin to perform this action" });
    } catch (error) {
        console.error("Error checking organization admin status.\n\n", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};