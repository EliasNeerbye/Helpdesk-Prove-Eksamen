const User = require('../../models/User');

module.exports = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if user is already in another organization
        const existingOrg = await Organization.findOne({ users: userToAdd._id });
        if (existingOrg) {
            return res.status(400).json({ message: "User already belongs to an organization" });
        }

        // Find the organization where the admin (requesting user) is a member
        const adminOrg = await Organization.findOne({ users: req.user._id });
        if (!adminOrg) {
            return res.status(404).json({ message: "You don't belong to any organization" });
        }

        if (adminOrg.users.includes(userToAdd._id)) {
            return res.status(400).json({ message: "User already exists in the organization" });
        }

        adminOrg.users.push(userToAdd._id);
        await adminOrg.save();

        return res.status(200).json({ message: "User added to organization successfully", organization: adminOrg });
    } catch (error) {
        console.error("Error adding user to organization.\n\n", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}