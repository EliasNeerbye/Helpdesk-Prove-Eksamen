const Profession = require('../../models/Profession');

module.exports = async (req, res) => {
    try {
        const professions = await Profession.find().sort({ name: 1 });
        
        return res.status(200).json({
            message: 'Professions retrieved successfully',
            professions
        });
    } catch (error) {
        console.error("Error retrieving professions.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}