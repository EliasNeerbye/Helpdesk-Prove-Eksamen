const router = require('express').Router();

const getUser = require('../middleware/getUser');
const isAdmin = require('../middleware/isAdmin');

router.use(getUser);

const createOrg = require('../controllers/org/createOrg');
const addUser = require('../controllers/org/addUser');
const removeUser = require('../controllers/org/removeUser');
const getUsers = require('../controllers/org/getUsers');

// Allow any user to create an organization without requiring isAdmin
router.post('/create', createOrg);

// Apply isAdmin middleware to the remaining routes
router.use(isAdmin);

router.get('/users', getUsers);
router.put('/user', addUser);
router.delete('/user/:userID', removeUser);

module.exports = router;