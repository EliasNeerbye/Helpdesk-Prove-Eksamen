const router = require('express').Router();
const getUser = require('../middleware/getUser');
const isAdmin = require('../middleware/isAdmin');
const rateLimit = require('express-rate-limit');

// Controllers
const getProfessions = require('../controllers/profession/getProfessions');
const createProfession = require('../controllers/profession/createProfession');

const professionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 profession creations per 15 minutes
    message: 'Too many profession creation attempts, please try again later',
});

// Get professions - available to all authenticated users
router.get('/list', getUser, getProfessions);

// Create profession - only available to admins
router.post('/create', getUser, isAdmin, professionLimiter, createProfession);

module.exports = router;