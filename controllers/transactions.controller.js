require("dotenv").config();
const ErrorResponse = require("../utils/errorResponse.js");
const { Transaction } = require("../models/Transaction");

/**
 * this is to get all users transactions
 *
 */
exports.GetAllTransactions = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalDocuments = await Transaction.countDocuments({});

    const transactions = await Transaction.find({})
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: "owner",
        select: "email", // Select only the 'email' field and exclude the '_id' field
      })
      .populate("payment.reciever", "email");

    if (!transactions || transactions.length === 0) {
      return next(new ErrorResponse("No transactions found"), 201);
    }

    const pagination = {};

    if (endIndex < totalDocuments) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit,
      };
    }

    res.status(200).json({ status: true, data: transactions, pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * this is to get specific users transactions
 *
 */
exports.GetUserTransactions = async (req, res, next) => {
  try {
    const { email } = req.params;
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalDocuments = await Transaction.countDocuments({ email: email });

    const transactions = await Transaction.find({ email: email })
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: "owner",
        select: "email", // Select only the 'email' field and exclude the '_id' field
      });

    if (!transactions || transactions.length === 0) {
      return next(new ErrorResponse("No transactions found"), 201);
    }

    const pagination = {};

    if (endIndex < totalDocuments) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit,
      };
    }

    res.status(200).json({ status: true, data: transactions, pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Transactions
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.GetTxId = async (req, res, next) => {
  try {
    const transactions = await Transaction.findById({ _id: req.params.id });
    if (!transactions)
      return next(new ErrorResponse("No transactions found"), 201);
    if (transactions)
      res.status(200).json({ status: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

/**
 * this is to update password after requesting
 *
 */
exports.UpdateTx = async (req, res, next) => {
  try {
    const tx = await Transaction.findById(req.body._id);
    console.log(tx, req.body, "Helllllllllllllllllllllp");
    if (!tx) {
      return next(new ErrorResponse(`Transaction not found.`, 402));
    }

    let objForUpdate = {};

    if (req.body.type === "Payment") {
      objForUpdate.payment = {};
      if (req.body.amount_initiated)
        objForUpdate.payment.amount_created = req.body.amount_initiated;
      if (req.body.amount_paid)
        objForUpdate.payment.amount_paid = req.body.amount_paid;
      if (req.body.accountName || req.body.accountNumber) {
        objForUpdate.payment.sender = {};
        if (req.body.accountName)
          objForUpdate.payment.sender.account_name = req.body.accountName;
        if (req.body.accountNumber)
          objForUpdate.payment.sender.account_number = req.body.accountNumber;
      }
    } else {
      objForUpdate.withdraw = {};
      if (req.body.withdrawAmount)
        objForUpdate.withdraw.amount = req.body.withdrawAmount;
      if (req.body.accountName || req.body.accountNumber) {
        objForUpdate.withdraw.reciever = {};
        if (req.body.accountName)
          objForUpdate.withdraw.reciever.account_name = req.body.accountName;
        if (req.body.accountNumber)
          objForUpdate.withdraw.reciever.account_number =
            req.body.accountNumber;
      }
    }

    console.log(objForUpdate, "Indigensddd");

    const updated = await Transaction.findOneAndUpdate(
      { _id: req.body._id },
      { $set: objForUpdate },
      { new: true }
    )
      .populate({
        path: "owner",
        select: "email", // Select only the 'email' field and exclude the '_id' field
      })
      .populate("payment.reciever", "email");

    res
      .status(200)
      .json({ status: true, data: updated, message: "Transaction updated" });
  } catch (error) {
    next(error);
  }
};
