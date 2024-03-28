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
const { Admin } = require("../models/Admin");
const { createToken } = require("../utils/createTokens");




/* Admin Login */
exports.loginUser = async (req, res, next) => {
  console.log(req.body, "Hello here");
  const { email, password } = req.body;

  try {
    const user = await Admin.login(email, password, next);

    const token = createToken(user._id);
    //sendResponseWithToken(res, 200, { success: true, data: user }, token);
    return res.status(200).json({ status: true, data: user, token: token });
  } catch (err) {
    next(err);
  }
};



/**
 * Get Admin Profile
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.GetProfile = async (req, res, next) => {
  try {
    const user = await Admin.findById(req.user._id);
    if (!user) {
      return next(new ErrorResponse(`user not found.`, 401));
    }
    res.status(200).json({ status: true, data: user });
  } catch (error) {
    next(error);
  }
};
