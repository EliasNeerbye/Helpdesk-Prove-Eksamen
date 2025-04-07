const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const getUser = require('../middleware/getUser');

// Rate limiting for comments
const commentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 comments per 15 minutes
    message: 'Too many comments posted, please try again later'
});

// Controllers
const addComment = require('../controllers/comment/addComment');
const getComments = require('../controllers/comment/getComments');

// Apply user middleware to all routes
router.use(getUser);

// Comment routes
router.post('/:ticketId/add', commentLimiter, addComment);
router.get('/:ticketId/list', getComments);

module.exports = router;