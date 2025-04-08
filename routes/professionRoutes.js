const router = require('express').Router();
const getUser = require('../middleware/getUser');
const isAdmin = require('../middleware/isAdmin');

// Controllers
const getProfessions = require('../controllers/profession/getProfessions');
const createProfession = require('../controllers/profession/createProfession');

// Get professions - available to all authenticated users
router.get('/list', getUser, getProfessions);

// Create profession - only available to admins
router.post('/create', getUser, isAdmin, createProfession);

module.exports = router;