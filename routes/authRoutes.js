const rateLimit = require('express-rate-limit');
const sessionExists = require('../middleware/sessionExists');
const router = require('express').Router();

router.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later',
    })
);

const register = require('../controllers/auth/register');
const login = require('../controllers/auth/login');

const logout = require('../controllers/auth/logout');

router.post('/register', sessionExists, register);
router.post('/login', sessionExists, login);
router.post('/logout', logout);

module.exports = router;