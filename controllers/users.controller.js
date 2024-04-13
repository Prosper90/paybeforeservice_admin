const bcrypt = require("bcrypt");
const { randomInt } = require("crypto");
const { makecall } = require("../utils/makeRequest");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse.js");
const { User } = require("../models/Users");
const jwt = require("jsonwebtoken");
const { sendPasswordEmail } = require("../utils/email");
const { Transaction } = require("../models/Transaction");
const { generateLocalHeader } = require("../utils/genHeadersData");
const { log } = require("console");

/*
 * this is to request change if the user forgets their password
 *
 */
exports.GetUsers = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalDocuments = await User.countDocuments();

    const users = await User.find({}).skip(startIndex).limit(limit);

    if (!users || users.length === 0) {
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

    const result = await User.aggregate([
      {
        $group: {
          _id: null,
          totalActiveUsers: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          totalInactiveUsers: {
            $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
          },
          totalVerifiedUsers: {
            $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] },
          },
        },
      },
    ]);

    // return res.status(200).json({status: true, data: result});

    const returnData = {
      totalUsers: totalDocuments,
      active: result[0].totalActiveUsers,
      inactive: result[0].totalInactiveUsers,
      unverified: result[0].totalVerifiedUsers,
    };

    return res
      .status(200)
      .json({ status: true, data: users, data_info: returnData, pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * this is to update password after requesting
 *
 */
exports.UpdateUsers = async (req, res, next) => {
  try {
    console.log(req.body, "quickly");
    const user = await User.findOne({ _id: req.body._id });
    if (!user) {
      return next(new ErrorResponse(`user not found.`, 401));
    }

    var objForUpdate = {};

    if (req.body.email) objForUpdate.email = req.body.email;
    if (req.body.first_name) objForUpdate.first_name = req.body.first_name;
    if (req.body.last_name) objForUpdate.last_name = req.body.last_name;
    if (req.body.bank_name)
      objForUpdate.bank_info.bank_name = req.body.bank_name;
    if (req.body.account_number)
      objForUpdate.bank_info.account_number = req.body.account_number;

    const updated = await User.findOneAndUpdate(
      { _id: req.body._id },
      { $set: objForUpdate },
      { new: true }
    );

    res
      .status(200)
      .json({ status: true, data: updated, message: "User updated" });
  } catch {
    next(error);
  }
};

/**
 * this is to update the user password
 *
 */
exports.BanUsers = async (req, res, next) => {
  const { _id } = req.body;

  try {
    const ban = await User.findOneAndUpdate(
      { _id: _id },
      {
        $set: { isActive: false },
      },
      { new: true }
    );
    console.log(ban, "reached");

    if (ban)
      res
        .status(200)
        .json({ status: true, data: ban, message: "user deactivated" });
  } catch (error) {
    next(error);
  }
};

exports.UnBanUsers = async (req, res, next) => {
  const { _id } = req.body;

  try {
    const unban = await User.findOneAndUpdate(
      { _id: _id },
      {
        $set: { isActive: true },
      },
      { new: true }
    );

    if (unban)
      res
        .status(200)
        .json({ status: true, data: unban, message: "user, activated" });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Refund
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.Refund = async (req, res, next) => {
  try {
    console.log("hi there");
    res.status(200).json({ status: true, message: "hi there" });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.ResetPassword = async (req, res, next) => {
  try {
    const { new_password, confirm_password, _id } = req.body;
    const user = await User.findOne({ _id: _id }).select("+password");
    if (!user) return next(new ErrorResponse("User doesnt exist", 401));
    if (new_password !== confirm_password)
      return next(new ErrorResponse("Password is not a match", 401));

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(new_password, salt);
    const userUpdated = await User.findOneAndUpdate(
      { _id: _id },
      {
        $set: { password: hash },
      },
      { new: true }
    );
    // Handle success case
    if (userUpdated)
      return res
        .status(200)
        .json({ status: true, data: userUpdated, message: "user updated" });
  } catch (error) {
    // Handle error case
    next(error);
  }
};

/**
 * Reset Pin
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.ResetPin = async (req, res, next) => {
  try {
    const { new_pin, confirm_pin, _id } = req.body;
    console.log(req.body, "mechaine");
    const user = await User.findOne({ _id: _id }).select("+password");
    if (!user) return next(new ErrorResponse("User doesnt exist", 401));
    if (new_pin !== confirm_pin)
      return next(new ErrorResponse("Pin is not a match", 401));

    const userUpdated = await User.findOneAndUpdate(
      { _id: _id },
      {
        $set: { pin: new_pin },
      },
      { new: true }
    );
    // Handle success case
    if (userUpdated)
      return res
        .status(200)
        .json({ status: true, data: userUpdated, message: "user updated" });
  } catch (error) {
    // Handle error case
    next(error);
  }
};

/**
 * this is to handle manual withdrawals
 *
 */
exports.Withdrawal = async (req, res, next) => {
  const { _id, withdrawal_id, action } = req.body;

  try {
    console.log(req.body, "being activeeeeeee");
    let updateWithdrawal;

    if (action === "approve") {
      updateWithdrawal = await User.findOneAndUpdate(
        {
          _id: _id,
          "withdrawalIssued.track_id": withdrawal_id,
        },
        {
          $set: {
            "withdrawalIssued.$.withrawal_requested": false,
            "withdrawalIssued.$.status": "success",
          },
        },
        { new: true }
      );

      //update transaction
      await Transaction.findOneAndUpdate(
        { track_id: withdrawal_id },
        { $set: { status: "success" } },
        { new: true }
      );
    } else {
      updateWithdrawal = await User.findOneAndUpdate(
        {
          _id: _id,
          "withdrawalIssued.track_id": withdrawal_id,
        },
        {
          $set: {
            "withdrawalIssued.$.withrawal_requested": false,
            "withdrawalIssued.$.status": "failed",
          },
        },
        { new: true }
      );

      //update transaction
      await Transaction.findOneAndUpdate(
        { track_id: withdrawal_id },
        { $set: { status: "failed" } },
        { new: true }
      );
    }

    // console.log(ban, "reached");
    if (updateWithdrawal)
      res.status(200).json({
        status: true,
        data: updateWithdrawal,
        message: "Users updated",
      });
  } catch (error) {
    next(error);
  }
};

exports.UnBanUsers = async (req, res, next) => {
  const { _id } = req.body;

  try {
    const unban = await User.findOneAndUpdate(
      { _id: _id },
      {
        $set: { isActive: true },
      },
      { new: true }
    );

    if (unban)
      res
        .status(200)
        .json({ status: true, data: unban, message: "user, activated" });
  } catch (error) {
    next(error);
  }
};
