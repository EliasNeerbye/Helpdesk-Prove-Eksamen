const router = require('express').Router();

const getUser = require('../middleware/getUser');
const isAdmin = require('../middleware/isAdmin');

router.use(getUser);
router.use(isAdmin);

const createOrg = require('../controllers/org/createOrg');
const addUser = require('../controllers/org/addUser');
const removeUser = require('../controllers/org/removeUser');
const getUsers = require('../controllers/org/getUsers');

router.post('/create', createOrg);
router.get('/users', getUsers);
router.put('/user', addUser);
router.delete('/user/:userID', removeUser);

module.exports = router;