const walletController = require("../controllers/wallet.controller");
const { requireAuth } = require("../middlewares/authMiddleware");
const express = require("express");

const router = express.Router();


router.get("/balance_info", requireAuth, walletController.WalletInfo);



module.exports = router;
