const User = require("../models/userModel");
const asyncErr = require("../middleware/asyncErr");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const Otp = require("../models/emailVerificationModel");
const TokenModel = require("../models/tokenModel");


// register user
exports.createUser = asyncErr(async (req, res, next) => {
  const { name, email, mobile, password, role } = req.body;
  const otp = Math.floor(Math.random() * 899999) + 100000;
  const hashedOtp = crypto.pbkdf2Sync(otp.toString(), process.env.SALT, 1000, 64, `sha512`).toString(`hex`)
  const user = await User.findOne({ email })
  if (user) {
    return next(new ErrorHandler("Email already exist", 400))
  }
  try {
    await sendEmail({
      email: email,
      subject: 'Verification for Sanjivani Video',
      message: `Otp:${otp}`,
    })

    let otpModel = await Otp.findOne({ email })
    if (!otpModel) {
      await Otp.create({
        email: email,
        otp: hashedOtp
      })
    }
    else {
      otpModel.otp = hashedOtp
      otpModel.createdAt = Date.now()
      otpModel.expiresAt = Date.now() + 1000 * 60 * 60
      await otpModel.save({ validateBeforeSave: false })
    }
  } catch (error) {
    res.send(error)
  }
  let cookieUser = {
    name,
    email,
    mobile,
    password,
    role,
    avatar: {
      public_id: "sample id",
      url: "sample url",
    },
  }
  let cookieUserStr = JSON.stringify(cookieUser)
  const options = {
    expires: new Date(
      Date.now() + 60 * 60 * 1000
    ),
    httpOnly: true
  }
  res.cookie("user", cookieUserStr, options)
  res.status(201).json({
    success: true,
    message: "otp sent to " + email
  })
});

// verify user
exports.verifyUser = asyncErr(async (req, res, next) => {
  const userData = JSON.parse(req.cookies.user)
  const { name, email, mobile, password, role } = userData;
  const enteredOtp = req.body.otp
  const otpModel = await Otp.findOne({ email })
  if (!otpModel || Date.now() > otpModel.expiresAt) {
    await Otp.deleteOne({ email })
    return next(new ErrorHandler("Otp expired", 400))
  }
  const hashedEnteredOtp = crypto.pbkdf2Sync(enteredOtp.toString(), process.env.SALT, 1000, 64, `sha512`).toString(`hex`)
  if (hashedEnteredOtp !== otpModel.otp) {
    return next(new ErrorHandler("Invalid Otp", 400))
  }
  let user = await User.create({
    name,
    email,
    mobile,
    password,
    role,
    avatar: {
      public_id: "sample id",
      url: "sample url",
    },
  });
  res.cookie("user", null, {
    expires: new Date(Date.now()),
    httpOnly: true,})

  await sendToken(user, 201, res);
  await Otp.deleteOne({ email })
  res.status(201).json({
    success: true
  })
})

// login user
exports.loginUser = asyncErr(async (req, res, next) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("Invalid login credentials", 401));
  }
  const isVerified = await user.verifyUser(password);
  if (!isVerified) {
    return next(new ErrorHandler("Invalid login credentials", 401));
  }



  sendToken(user, 200, res);
});

// logout user
exports.logout = asyncErr(async (req, res, next) => {
  const token = req.cookies.jwt
  const user = req.user
  const userToken = await TokenModel.findOne({ user: user._id })
  userToken.tokens.forEach((elem, index) => {
    if (userToken.tokens[index].token === token) {
      userToken.tokens.splice(index, 1)
    }
  })
  await userToken.save({ validateBeforeSave: false })
  res.cookie("jwt", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.cookie("profile", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "logged out successfully",
  });
});

// logout user from all devices
exports.logoutAll = asyncErr(async (req, res, next) => {
  const token = req.cookies.jwt
  const user = req.user
  const userToken = await TokenModel.findOne({ user: user._id })
  userToken.tokens = []
  await userToken.save({ validateBeforeSave: false })
  res.cookie("jwt", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.cookie("profile", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "logged out successfully",
  });
});

// get user details
exports.userDetails = asyncErr(async (req, res, next) => {
  const user = await User.findOne({email:req.user.email},{password:0})
  if (!user) {
    return next(new ErrorHandler("user not found", 404))
  }
  res.status(200).json({
    success: true,
    user
  })
})

// forgot password

exports.forgot = asyncErr(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }
  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  const message = `Hello ${user.name}\n\nTo reset your password please click on:- \n\n${resetUrl}\n\nIf your havn't requeseted please ignore.\n\n\n*This is an auto generated mail please don't reply.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// reset password
exports.reset = asyncErr(async (req, res, next) => {
  const resetpasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetpasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("password did'n matched", 500));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save()
  sendToken(user, 200, res);
});

// change password
exports.updatePassword = asyncErr(async (req, res, next) => {
  const user = req.user
  if (!user) {
    return next(new ErrorHandler("user not found", 404))
  }
  const isVerified = await user.verifyUser(req.body.password)
  if (!isVerified) {
    return next(new ErrorHandler("incorrect password", 400))
  }
  if (req.body.newPassword !== req.body.confirmNewPassword) {
    return next(new ErrorHandler("password didn't matched", 400))
  }
  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res)
  res.status(201).json({
    success: true,
    message: "password updated"
  })

})

// get all user --admin
exports.getAllUser = asyncErr(async (req, res, next) => {
  const users = await User.find({ "role": "user" },{password:0});
  if (!users) {
    return next(new ErrorHandler("No user found", 404))
  }

  res.status(200).json({
    success: true,
    users
  })

})

// get single user details --admin
exports.getSingleUser = asyncErr(async (req, res, next) => {
  const user = await User.findById(req.params.id,{password:0})
  if (!user) {
    return next(new ErrorHandler("user not found", 404))
  }

  res.status(200).json({
    success: true,
    user
  })
})

// update user role --admin
exports.updateUserRole = asyncErr(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new ErrorHandler("user not found", 404))
  }
  user.role = req.body.role;
  await user.save();

  res.status(200).json({
    success: true,
    user
  })
})

// block user --admin
exports.blockUser = asyncErr(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new ErrorHandler("user not found", 404))
  }
  user.role = "blocked";
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    user
  })
})

// unblock user --admin
exports.unblockUser = asyncErr(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new ErrorHandler("user not found", 404))
  }
  user.role = "user";
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    user
  })
})

// delete user
exports.deleteUser = asyncErr(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new ErrorHandler("user not found", 404))
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: "user removed successfully"
  })
})