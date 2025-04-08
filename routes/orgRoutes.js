const router = require('express').Router();

const getUser = require('../middleware/getUser');
const isOrgAdmin = require('../middleware/isOrgAdmin');

router.use(getUser);

const createOrg = require('../controllers/org/createOrg');
const addUser = require('../controllers/org/addUser');
const removeUser = require('../controllers/org/removeUser');
const getUsers = require('../controllers/org/getUsers');
const toggleOrgAdmin = require('../controllers/org/toggleOrgAdmin');

router.post('/create', createOrg);
router.get('/users', getUsers);

router.put('/user', isOrgAdmin, addUser);
router.delete('/user/:userID', isOrgAdmin, removeUser);
router.post('/toggle-admin', isOrgAdmin, toggleOrgAdmin);

module.exports = router;