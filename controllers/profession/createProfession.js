const Profession = require('../../models/Profession');

module.exports = async (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: 'Profession name is required' });
    }
    
    try {
        // Check if profession already exists
        const existingProfession = await Profession.findOne({ name });
        if (existingProfession) {
            return res.status(409).json({ message: 'Profession already exists' });
        }
        
        // Create new profession
        const newProfession = new Profession({
            name,
            description: description || ''
        });
        
        await newProfession.save();
        
        return res.status(201).json({
            message: 'Profession created successfully',
            profession: newProfession
        });
    } catch (error) {
        console.error("Error creating profession.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}