const router = require('express').Router();

const getUser = require('../middleware/getUser');
const isAdmin = require('../middleware/isAdmin');

const createOrg = require('../controllers/org/createOrg');
const addUser = require('../controllers/org/addUser');
const removeUser = require('../controllers/org/removeUser');
const getUsers = require('../controllers/org/getUsers');

router.post('/create', getUser, isAdmin, createOrg);
router.get('/users', getUser, isAdmin, getUsers);
router.put('/user', getUser, isAdmin, addUser);
router.delete('/user/:userID', getUser, isAdmin, removeUser);

module.exports = router;