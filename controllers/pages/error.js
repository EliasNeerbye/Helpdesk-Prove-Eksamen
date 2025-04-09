module.exports = (req, res) => {
    res.render('error', { 
        title: 'Error',
        message: req.query.message || 'An error occurred',
        error: null
    });
};