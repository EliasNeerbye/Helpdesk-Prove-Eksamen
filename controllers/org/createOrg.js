const Organization = require("../../models/Organization");

module.exports = async (req, res) => {
    try {
        const alreadyInOrg = await Organization.findOne({ users: req.user._id });
        if (alreadyInOrg) {
            return res.status(400).json({ message: "You already belong to an organization" });
        }
    } catch (error) {
        console.error("Error checking if user is in an organization.\n\n", error);
        return res.status(500).json({ message: "Internal server error" });
    }

    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: "Name and description are required" });
    }

    if (name.length < 3 || name.length > 50) {
        return res.status(400).json({ message: "Name must be between 3 and 50 characters" });
    }

    if (description && description.length > 200) {
        return res.status(400).json({ message: "Description must be less than 200 characters" });
    }

    try {
        const exists = await Organization.findOne({ name });
        if (exists) {
            return res.status(400).json({ message: "Organization already exists" });
        }
    } catch (error) {
        console.error("Error checking organization existence.\n\n", error);
        return res.status(500).json({ message: "Internal server error" });
    }

    try {
        const newOrg = new Organization({
            name,
            description,
            admin: req.user._id, // Set the creating user as the admin
            users: [req.user._id], // Add the user to the organization
        });
        
        await newOrg.save();
        return res.status(201).json({ 
            message: "Organization created successfully",
            organization: newOrg
        });
    } catch (error) {
        console.error("Error saving organization.\n\n", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};