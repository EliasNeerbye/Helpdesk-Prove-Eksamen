const router = require('express').Router();
const rateLimit = require('express-rate-limit');

const getUser = require("../middleware/getUser");

const createProfile = require("../controllers/profile/createProfile");
const getProfile = require("../controllers/profile/getProfile");
const updateProfile = require("../controllers/profile/updateProfile");
const deleteProfile = require("../controllers/profile/deleteProfile");

const profileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 profile-related actions per 15 minutes
    message: 'Too many profile actions, please try again later',
});

router.post("/create", profileLimiter, getUser, createProfile);
router.get("/get", getUser, getProfile);
router.put("/update", profileLimiter, getUser, updateProfile);
router.delete("/delete", getUser, deleteProfile);

module.exports = router;