const router = require('express').Router();
const getUser = require('../middleware/getUser');

// Controllers
const addFeedback = require('../controllers/feedback/addFeedback');
const getFeedback = require('../controllers/feedback/getFeedback');

// Apply user middleware to all routes
router.use(getUser);

// Feedback routes
router.post('/:ticketId/add', addFeedback);
router.get('/:ticketId', getFeedback);

module.exports = router;