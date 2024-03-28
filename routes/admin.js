const adminController = require("../controllers/admin.controller");
const { requireAuth } = require("../middlewares/authMiddleware");
const express = require("express");

const router = express.Router();

router.get("/get_admins", requireAuth, adminController.GetAdmins)
router.post("/assign_role", requireAuth, adminController.Assign);



module.exports = router;
