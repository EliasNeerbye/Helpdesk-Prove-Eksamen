const Organization = require("../../models/Organization");

module.exports = async (req, res) => {
    const { userID } = req.params;

    if (!userID) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        // Find the organization where the requesting user is a member
        const org = await Organization.findOne({ users: req.user._id });
        if (!org) {
            return res.status(404).json({ message: "You don't belong to any organization" });
        }

        // Check if the user to remove exists in the organization
        if (!org.users.includes(userID)) {
            return res.status(404).json({ message: "User is not a member of this organization" });
        }

        // Prevent removing yourself
        if (userID === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot remove yourself from the organization" });
        }

        // Remove the user from the organization
        org.users = org.users.filter(user => user.toString() !== userID);
        await org.save();

        return res.status(200).json({ 
            message: "User removed from organization successfully", 
            organization: org 
        });
    } catch (error) {
        console.error("Error removing user from organization.\n\n", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}