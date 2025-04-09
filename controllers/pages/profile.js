const Profession = require('../../models/Profession');

module.exports = async (req, res) => {
    try {
        const professions = await Profession.find().sort({ name: 1 });
        res.render('profile', { 
            title: 'My Profile',
            user: req.user,
            isAdmin: req.user.role === 'admin',
            professions
        });
    } catch (error) {
        console.error("Error rendering profile:", error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : null
        });
    }
};