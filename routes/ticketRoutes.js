const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const getUser = require('../middleware/getUser');
const isAdmin = require('../middleware/isAdmin');

// Rate limiting for ticket creation
const createTicketLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 ticket creations per 15 minutes
    message: 'Too many tickets created, please try again later'
});

// Controllers
const createTicket = require('../controllers/ticket/createTicket');
const createTicketForUser = require('../controllers/ticket/createTicketForUser');
const getTickets = require('../controllers/ticket/getTickets');
const getTicketById = require('../controllers/ticket/getTicketById');
const updateTicket = require('../controllers/ticket/updateTicket');
const deleteTicket = require('../controllers/ticket/deleteTicket'); // New controller
const getTicketStats = require('../controllers/ticket/getTicketStats');

// Apply user middleware to all routes
router.use(getUser);

// Ticket routes
router.post('/create', createTicketLimiter, createTicket);
router.post('/create-for-user', isAdmin, createTicketForUser);
router.get('/list', getTickets);
router.get('/stats', getTicketStats);
router.get('/:ticketId', getTicketById);
router.put('/:ticketId', updateTicket);
router.delete('/:ticketId', isAdmin, deleteTicket); // New route for ticket deletion

module.exports = router;