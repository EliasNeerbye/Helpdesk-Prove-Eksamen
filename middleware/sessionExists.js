module.exports = async (req, res, next) => {
    if (req.session.user) {
        return res.status(401).json({ message: "Already logged in" });
    }
    next();
}