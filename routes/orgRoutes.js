const router = require('express').Router();
const rateLimit = require('express-rate-limit');

const getUser = require('../middleware/getUser');
const isOrgAdmin = require('../middleware/isOrgAdmin');

router.use(getUser);

const createOrg = require('../controllers/org/createOrg');
const addUser = require('../controllers/org/addUser');
const removeUser = require('../controllers/org/removeUser');
const getUsers = require('../controllers/org/getUsers');
const toggleOrgAdmin = require('../controllers/org/toggleOrgAdmin');

const orgLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 10 organization-related actions per 15 minutes
    message: 'Too many organization actions, please try again later',
});

router.post('/create', createOrg);
router.get('/users', getUsers);

router.put('/user', orgLimiter, isOrgAdmin, addUser);
router.delete('/user/:userID', isOrgAdmin, removeUser);
router.post('/toggle-admin', orgLimiter, isOrgAdmin, toggleOrgAdmin);

module.exports = router;