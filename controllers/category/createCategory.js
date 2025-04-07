const Category = require('../../models/Category');

module.exports = async (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
    }
    
    try {
        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(409).json({ message: 'Category already exists' });
        }
        
        // Create new category
        const newCategory = new Category({
            name,
            description: description || ''
        });
        
        await newCategory.save();
        
        return res.status(201).json({
            message: 'Category created successfully',
            category: newCategory
        });
    } catch (error) {
        console.error("Error creating category.\n\n", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}