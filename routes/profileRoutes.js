const router = require('express').Router();

const getUser = require("../middleware/getUser");

const createProfile = require("../controllers/profile/createProfile");
const getProfile = require("../controllers/profile/getProfile");
const updateProfile = require("../controllers/profile/updateProfile");
const deleteProfile = require("../controllers/profile/deleteProfile");

router.post("/create", getUser, createProfile);
router.get("/get", getUser, getProfile);
router.put("/update", getUser, updateProfile);
router.delete("/delete", getUser, deleteProfile);

module.exports = router;