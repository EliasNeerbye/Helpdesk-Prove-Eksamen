const Organization = require("../../models/Organization");

module.exports = async (req, res) => {
    try {
        // Find the organization where the requesting user is a member
        const org = await Organization.findOne({ users: req.user._id })
            .populate({
                path: 'users',
                select: '-password -__v',
                populate: {
                    path: 'profile',
                    populate: {
                        path: 'profession'
                    }
                }
            })
            .lean();

        if (!org) {
            return res.status(404).json({ message: "You don't belong to any organization" });
        }

        // Add isOrgAdmin and isMainAdmin flags to each user
        const usersWithAdminInfo = org.users.map(user => {
            return {
                ...user,
                isOrgAdmin: org.orgAdmins?.includes(user._id) || false,
                isMainAdmin: org.admin.toString() === user._id.toString()
            };
        });

        return res.status(200).json({ 
            message: "Users retrieved successfully",
            users: usersWithAdminInfo,
            currentUserIsAdmin: 
                req.user.role === 'admin' || 
                org.admin.toString() === req.user._id.toString() || 
                org.orgAdmins?.includes(req.user._id) || false
        });

    } catch (error) {
        console.error("Error retrieving organization users.\n\n", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}