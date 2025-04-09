const Category = require('../../models/Category');

module.exports = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.render('create-ticket', { 
            title: 'Create Ticket',
            user: req.user,
            isAdmin: req.user.role === 'admin',
            categories
        });
    } catch (error) {
        console.error("Error rendering create ticket form:", error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : null
        });
    }
};