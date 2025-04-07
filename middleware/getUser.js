const User = require("../models/User");

module.exports = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    let user;

    try {
        user = await User.findById(req.session.userId).select("-password -__v").populate("profile");
        if (!user) {
            req.session.destroy(err => {
                if (err) {
                    console.error("Error destroying session:", err);
                }
            });
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Error fetching user.\n\n", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}