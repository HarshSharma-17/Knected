/**
 * githubRoutes.js
 * 
 * defines api routes related to github repositories
 */

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
    cloneRepository,
} = require("../controllers/githubController");

const router = express.Router();

//clone a github repsoitory
router.post("/clone", authMiddleware, cloneRepository);

module.exports = router;