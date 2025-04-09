const express = require('express');
const router = express.Router();
const getUser = require('../middleware/getUser');

// Import controllers
const login = require('../controllers/pages/login');
const register = require('../controllers/pages/register');
const dashboard = require('../controllers/pages/dashboard');
const tickets = require('../controllers/pages/tickets');
const ticketDetail = require('../controllers/pages/ticketDetail');
const createTicket = require('../controllers/pages/createTicket');
const profile = require('../controllers/pages/profile');
const adminCategories = require('../controllers/pages/adminCategories');
const adminProfessions = require('../controllers/pages/adminProfessions');
const adminUsers = require('../controllers/pages/adminUsers');
const errorPage = require('../controllers/pages/error');

// Public routes
router.get('/login', login);
router.get('/register', register);

// Protected routes
router.use(async (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
});

router.get(['/', '/dashboard'], getUser, dashboard);
router.get('/tickets', getUser, tickets);
router.get('/tickets/:ticketId', getUser, ticketDetail);
router.get('/create-ticket', getUser, createTicket);
router.get('/profile', getUser, profile);

// Admin routes
router.get('/admin/categories', getUser, adminCategories);
router.get('/admin/professions', getUser, adminProfessions);
router.get('/admin/users', getUser, adminUsers);

// Error page
router.get('/error', errorPage);

module.exports = router;