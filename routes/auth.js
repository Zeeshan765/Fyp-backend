const express = require('express');
const router = express.Router();
let { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const validateUser = require('../middleware/validateUser');
//const validateLogin = require('../middleware/validateUser');
//const validateUserRegister = require('../middleware/validateUser');
const validateReset = require('../middleware/validateUser');

const crypto = require('crypto');
const sendEmail = require('../utilis/sendEmail');
//validateUser
//Register
router.post('/register', async (req, res) => {
  console.log(req.body);

  let user = await User.findOne({ email: req.body.email });
  if (user)
    return res.status(400).json('User with Given Email Already Exsist ');
  user = new User();
  (user.name = req.body.name),
    (user.email = req.body.email),
    (user.phone = req.body.phone),
    (user.password = req.body.password);
  let accessToken = user.generateToken(); //----->Genrate Token
  await user.save();
  //const { password, ...info } = user._doc;
  let datatoReturn = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    accessToken: accessToken,
  };
  res.status(200).json(datatoReturn);
});

//Login
router.post('/login', async (req, res) => {
  //Check the user exsit in database or not
  let user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user) return res.status(400).json('User Not Registered');
  //If user Exsist then compare it password with the database password
  let matchpassword = await bcrypt.compare(req.body.password, user.password);
  if (!matchpassword) return res.status(401).json('Invalid Password');
  //If user esists then assign token to that user
  let accessToken = user.generateToken(); //----->Genrate Token
  res.json(accessToken);
  console.log(user._id);
});

//Forget Password
router.post('/forgetpassword', async (req, res) => {
  /*try {
    const user = User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json('Email does not Exsist');
    // Reset Token Gen and add to database hashed (private) version of token
    const resetToken = user.getResetPasswordToken();
    await user.save();
    // Create reset url to email to provided email
    const rresetPasswordUrl = `${req.protocol}://${req.get(
      'host'
    )}/passwordreset/${resetToken}`;
    // HTML Message
    const message = `
       <h1>You have requested a password reset</h1>
       <p>Please make a put request to the following link:</p>
       <a href=${rresetPasswordUrl} clicktracking=off>${rresetPasswordUrl}</a>
     `;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        text: message,
      });
      res.status(200).json('Email Sent Successfully ');
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json('Email Could Not b send');
    }
  } catch (error) {
    return res.status(501).json('Bhai nai honi email send');
  }*/

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json('User Not Exsist');
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save();

  const resetPasswordUrl = `http://localhost:3000/passwordreset/${resetToken}`;
  // const resetPasswordUrl = `http://localhost:3000/passwordreset`;
  const message = `
     <h4>Hi,</h4>
     <p>You're recieving this email because we've recieved a password reset request from your account. If you didn't request a password reset, no further action is required.</p>
     <p>Please Click on  the following link:</p>
     <a href=${resetPasswordUrl} clicktracking=off>${resetPasswordUrl}</a>
   `;

  try {
    await sendEmail({
      to: user.email,
      subject: `Password Reset Request`,
      text: message,
    });

    res.status(200).json({
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(500).json(' Email Could Not be  Send');
  }
});

//Reset Password Route

router.put('/passwordreset/:resetToken', validateReset, async (req, res) => {
  //Hash the token which is provides in the url and generate the new token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    //Check that Token is Expired or not
    if (!user) {
      return res.status(400).json('Token is Expired or Invalid');
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      data: 'Password Updated Success',
      //token: user.generateToken(),
    });
  } catch (error) {
    console.log(error);
  }
});

//send otp to user for forgot password
router.post('/sendotp', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json('User Not Registered');
  else {
    //If user Exsist then send Otp to that user
    let OTP = Math.floor(Math.random() * 10000 + 1).toString();
    console.log(OTP);
    console.log(user._id);
    let newOtpExpiry = new Date(); // current time
    let nowMinutes = newOtpExpiry.getMinutes();
    newOtpExpiry.setMinutes(nowMinutes + 5);
    console.log(newOtpExpiry);
    await User.findByIdAndUpdate(user._id, {
      otp: OTP,
      otpExpiry: newOtpExpiry,
    });

    const message = `
      <h4>Hi,</h4>
      <p>You're recieving this email because we've recieved a password reset request from your account. If you didn't request a password reset, no further action is required.</p>
      <p>Your OTP is this:</p>
      <p>${OTP}</p>

    `;
    try {
      await sendEmail({
        to: user.email,
        subject: `Password Reset Request`,
        text: message,
      });
      res.status(200).json({
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      return res.status(500).json(' Email Could Not be  Send');
    }
  }
});
//password reset of particular user
router.put('/resetpassword/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  console.log(user)
  if (user) {
    let nowTime = new Date();
    if (nowTime > user.otpExpiry) {
      if (req.body.otp == user.otp) {
        let salt = await bcrypt.genSalt(10);
        let resetPassword = await bcrypt.hash(req.body.password, salt);
        await User.findByIdAndUpdate(user._id, {
          password: resetPassword,
          otpExpiry: nowTime,
        });
        res.status(200).json('Password Reset Successfully');
      } else {
        res.status(400).json('OTP is Invalid');
      }
    } else {
      res.status(400).json('OTP is Expired');
    }
  } else {
    res.status(400).json('User Not Found');
  }
});

module.exports = router;
