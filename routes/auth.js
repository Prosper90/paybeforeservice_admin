const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/authMiddleware");
const express = require("express");

const router = express.Router();


router.get("/get_profile", requireAuth, authController.GetProfile)
router.post("/login",  authController.loginUser);


module.exports = router;
