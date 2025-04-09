module.exports = async (req, res) => {
    try {
        const isSupport = req.user.role === '1st-line' || req.user.role === '2nd-line';
        res.render('ticket-detail', { 
            title: 'Ticket Details',
            user: req.user,
            isAdmin: req.user.role === 'admin',
            ticketId: req.params.ticketId,
            isSupport
        });
    } catch (error) {
        console.error("Error rendering ticket detail:", error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : null
        });
    }
};