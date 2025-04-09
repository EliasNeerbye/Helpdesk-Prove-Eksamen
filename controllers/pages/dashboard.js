module.exports = async (req, res) => {
    try {
        res.render('dashboard', { 
            title: 'Dashboard',
            user: req.user,
            isAdmin: req.user.role === 'admin'
        });
    } catch (error) {
        console.error("Error rendering dashboard:", error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : null
        });
    }
};