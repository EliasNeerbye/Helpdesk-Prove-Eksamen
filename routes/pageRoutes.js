const express = require('express');
const router = express.Router();
const getUser = require('../middleware/getUser');
const Category = require('../models/Category');
const Profession = require('../models/Profession');

// Public routes
router.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('login', { 
        title: 'Login',
        error: req.query.error || null
    });
});

router.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('register', { 
        title: 'Register',
        error: req.query.error || null
    });
});

// Protected routes (require authentication)
router.use(async (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    // Pass along for auth middleware
    next();
});

// Main dashboard
router.get(['/', '/dashboard'], getUser, async (req, res) => {
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
});

// Tickets list
router.get('/tickets', getUser, async (req, res) => {
    try {
        res.render('tickets', { 
            title: 'Tickets',
            user: req.user,
            isAdmin: req.user.role === 'admin'
        });
    } catch (error) {
        console.error("Error rendering tickets page:", error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : null
        });
    }
});

// Single ticket view
router.get('/tickets/:ticketId', getUser, async (req, res) => {
    try {
        res.render('ticket-detail', { 
            title: 'Ticket Details',
            user: req.user,
            isAdmin: req.user.role === 'admin',
            ticketId: req.params.ticketId
        });
    } catch (error) {
        console.error("Error rendering ticket detail:", error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : null
        });
    }
});

// New ticket form
router.get('/create-ticket', getUser, async (req, res) => {
    try {
        // Get all categories for the dropdown
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
});

// User profile
router.get('/profile', getUser, async (req, res) => {
    try {
        // Get all professions for the dropdown
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
});

// Admin routes
router.get('/admin/categories', getUser, async (req, res) => {
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
});

router.get('/admin/professions', getUser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }
    
    try {
        res.render('admin/professions', { 
            title: 'Manage Professions',
            user: req.user,
            isAdmin: true
        });
    } catch (error) {
        console.error("Error rendering professions admin:", error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : null
        });
    }
});

router.get('/admin/users', getUser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }
    
    try {
        res.render('admin/users', { 
            title: 'Manage Users',
            user: req.user,
            isAdmin: true
        });
    } catch (error) {
        console.error("Error rendering users admin:", error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error : null
        });
    }
});

// Error page
router.get('/error', (req, res) => {
    res.render('error', { 
        title: 'Error',
        message: req.query.message || 'An error occurred',
        error: null
    });
});

module.exports = router;