const router = require('express').Router();
const getUser = require('../middleware/getUser');
const isAdmin = require('../middleware/isAdmin');

// Controllers
const createCategory = require('../controllers/category/createCategory');
const getCategories = require('../controllers/category/getCategories');

// Get categories - available to all authenticated users
router.get('/list', getUser, getCategories);

// Create category - only available to admins
router.post('/create', getUser, isAdmin, createCategory);

module.exports = router;