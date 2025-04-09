const router = require('express').Router();
const getUser = require('../middleware/getUser');
const isAdmin = require('../middleware/isAdmin');

// Controllers
const changeRole = require('../controllers/user/changeRole');

// Apply middleware
router.use(getUser);

// Admin-only routes
router.post('/change-role', isAdmin, changeRole);

module.exports = router;