require("dotenv").config();
const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const ErrorResponse = require("../utils/errorResponse");



const adminSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [8, "Minimum password length is 8 characters"],
      select: false,
    },
    status: {type: String, default: "active"},
    isActive: { type: Boolean, default: true },
    role: { type: String }, //there is superAdmin, and then there is a
  },
  { timestamps: true }
);



// static method to login user
adminSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email: email }).select("+password");

  if (!user) {
    throw new ErrorResponse("incorrect email", 401);
  }
  // return next(new ErrorResponse("incorrect email", 401));
  const auth = await bcrypt.compare(password, user.password);
  if (!auth) {
    throw new ErrorResponse("incorrect password", 401);
  }
  // return next(new ErrorResponse("incorrect password", 401));

  return user;
};


adminSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

adminSchema.set("toJSON", {
  virtuals: true,
});

module.exports = {
  Admin: mongoose.model("Admin", adminSchema),
};
