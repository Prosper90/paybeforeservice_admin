const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/authMiddleware");

const transactionController = require("../controllers/transactions.controller");

router.get("/getAllTx", requireAuth, transactionController.GetAllTransactions);

router.get(
  "/getUserTx/:email",
  requireAuth,
  transactionController.GetAllTransactions
);

router.get("/getTx/:id", requireAuth, transactionController.GetTxId);

router.put("/update_tx", requireAuth, transactionController.UpdateTx);

module.exports = router;
