const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('@hapi/joi');

//Create The Schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },

    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      default: 'user',
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  //  resetOtpExpire: Date,
  },
  { timestamps: true }
);

//Hash the Password

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  let salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//generate the token
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    { _id: this._id, name: this.name, role: this.role },
    process.env.JWT_KEY
  );
};

//Generate the Reset Password Token
UserSchema.methods.getResetPasswordToken = function () {
  //Generate the Reset Token
  const resetToken = crypto.randomBytes(20).toString('hex');

  //Hash the Above Reset Token add the resetpasswordtoken to user Schema
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //Assign the resetpasswordToken Expire Time
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

//Create the Model

var User = mongoose.model('User', UserSchema);

//Validation
function validateUser(data) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(10).required(),
    email: Joi.string().email().min(3).max(20).required(),
    phone: Joi.string().min(8).max(11).required(),
    password: Joi.string().min(5).max(10).required(),
  });
  return schema.validate(data, { abortEarly: false });
}

function validateUserLogin(data) {
  const schema = Joi.object({
    email: Joi.string().email().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  return schema.validate(data, { abortEarly: false });
}

function validateUserReset(data) {
  const schema = Joi.object({
    password: Joi.string().min(5).max(10).required(),
  });
  return schema.validate(data, { abortEarly: false });
}

//Export
module.exports.User = User;
module.exports.validate = validateUser; //for sign up
module.exports.validateUserLogin = validateUserLogin; // for login
module.exports.validateUserReset = validateUserReset; // for Reset Password
