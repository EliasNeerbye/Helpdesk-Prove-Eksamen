const Category = require('../../models/Category');

module.exports = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        
        return res.status(200).json({
            message: 'Categories retrieved successfully',
            categories
        });
    } catch (error) {
        console.error("Error retrieving categories.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}