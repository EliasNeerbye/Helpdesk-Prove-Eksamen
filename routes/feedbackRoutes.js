const router = require('express').Router();
const getUser = require('../middleware/getUser');
const rateLimit = require('express-rate-limit');

// Controllers
const addFeedback = require('../controllers/feedback/addFeedback');
const getFeedback = require('../controllers/feedback/getFeedback');

// Rate limiter for feedback submissions
const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 feedback submissions per 15 minutes
    message: 'Too many feedback submissions, please try again later',
});

// Apply user middleware to all routes
router.use(getUser);

// Feedback routes
router.post('/:ticketId/add', feedbackLimiter, addFeedback);
router.get('/:ticketId', getFeedback);

module.exports = router;