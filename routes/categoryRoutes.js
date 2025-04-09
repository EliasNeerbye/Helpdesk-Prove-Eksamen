const router = require('express').Router();
const getUser = require('../middleware/getUser');
const isAdmin = require('../middleware/isAdmin');
const rateLimit = require('express-rate-limit');

// Controllers
const createCategory = require('../controllers/category/createCategory');
const getCategories = require('../controllers/category/getCategories');

const categoryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 category creations per 15 minutes
    message: 'Too many category creation attempts, please try again later',
});

// Get categories - available to all authenticated users
router.get('/list', getUser, getCategories);

// Create category - only available to admins
router.post('/create', getUser, isAdmin, categoryLimiter, createCategory);

module.exports = router;