const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/authMiddleware");

const userController = require("../controllers/users.controller");

//for personal profiles
router.get("/get_users", requireAuth, userController.GetUsers);

router.put("/update_user", requireAuth, userController.UpdateUsers);

router.put("/ban_user", requireAuth, userController.BanUsers);

router.put("/unban_user", requireAuth, userController.UnBanUsers);

router.put("/refund", requireAuth, userController.Refund);

router.put("/reset_password", requireAuth, userController.ResetPassword);

router.put("/reset_pin", requireAuth, userController.ResetPin);

module.exports = router;
