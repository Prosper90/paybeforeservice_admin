require("dotenv").config();
const bcrypt = require("bcrypt");
const { sendResponseWithToken } = require("../utils/handleResponse");
const { makecall } = require("../utils/makeRequest");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse.js");
const { generateLocalHeader } = require("../utils/genHeadersData");
const { sendOtp } = require("../utils/sendOtp");
//const client = new twilio(process.env.TwilloaccountSid, process.env.TwilloauthToken);
const { v4: uuidv4 } = require("uuid");
const { User } = require("../models/Users");
const { createToken } = require("../utils/createTokens");
const { Admin } = require("../models/Admin.js");






/*
 * this is to request change if the user forgets their password
 *
 */
exports.GetAdmins = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalDocuments = await Admin.countDocuments();

    const admins = await Admin.find({})
      .skip(startIndex)
      .limit(limit);

    if (!admins || admins.length === 0) {
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

    const result = await Admin.aggregate([
      {
        $group: {
          _id: null,
          totalActiveAdmins: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          totalInactiveAdmins: { $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] } },
          totalBanned: { $sum: { $cond: [{ $eq: ['$status', "banned"] }, 1, 0] } }
        }
      }
    ]);
    
    // return res.status(200).json({status: true, data: result});

    const returnData = {
      totalAdmins: totalDocuments,
      active: result[0].totalActiveUsers || 0,
      inactive: result[0].totalInactiveUsers || 0,
      banned: result[0].totalBanned || 0,
    }

    return res.status(200).json({ status: true, data: admins, data_info: returnData, pagination });
  } catch (error) {
    next(error);
  }
};


exports.Assign = async (req, res, next) => {
  console.log(req.body, "Hello here");
  const { email, password, role } = req.body;

  try {
    // Find admin first
    const findAdmin = await Admin.findOne({ email });
    if (findAdmin) {
      return next(
        new ErrorResponse(`Admin already exists and ${findAdmin.role} assigned`, 400)
      );
    }

    console.log("akt nn");
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("inconstitute");

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      role,
    });

    await newAdmin.save();

    console.log("jjks", newAdmin);
    return res.status(200).json({
      status: true,
      data: newAdmin,
      message: "Admin Created",
    });
  } catch (err) {
    next(err);
  }
};
