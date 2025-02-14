const express = require("express");
const router = express.Router();

//Controllers
const { signup, login } = require("../controllers/auth");

// Middleware

const { auth } = require("../middleware/auth");

//Route for user signup
router.post("/signup", signup);

//Route for user login
router.post("/login", login);

module.exports = router;
