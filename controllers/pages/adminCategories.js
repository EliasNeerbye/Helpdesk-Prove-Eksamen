module.exports = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }
    try {
        res.render('admin/categories', { 
            title: 'Manage Categories',
            user: req.user,
            isAdmin: true
        });
    } catch (error) {
        console.error("Error rendering categories admin:", error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : null
        });
    }
};