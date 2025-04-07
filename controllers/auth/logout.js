module.exports = async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session.\n\n", err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            return res.status(200).json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.error("Error during logout.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}