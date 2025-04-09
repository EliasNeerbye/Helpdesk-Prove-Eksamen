module.exports = async (req, res) => {
    try {
        res.render('tickets', { 
            title: 'Tickets',
            user: req.user,
            isAdmin: req.user.role === 'admin',
        });
    } catch (error) {
        console.error("Error rendering tickets page:", error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : null
        });
    }
};