const User = require("../models/userModel");
const asyncErr = require("../middleware/asyncErr");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto")


// register user
exports.createUser = asyncErr(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  let user = await User.create({
    name,
    email,
    password,
    role,
    avatar: {
      public_id: "sample id",
      url: "sample url",
    },
  });
  sendToken(user, 201, res);
});

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
    user.tokens.forEach((elem,index)=>{
        if (user.tokens[index].token===token){
            user.tokens.splice(index,1)
        }
    })
    await user.save({validateBeforeSave:false})
    res.cookie("jwt", null, {
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
    user.tokens=[]
    await user.save({validateBeforeSave:false})
    res.cookie("jwt", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "logged out successfully",
    });
  });

// get user details
  exports.userDetails = asyncErr(async(req,res,next)=>{
    const user=req.user
    if(!user){
      return next(new ErrorHandler("user not found",404))
    }
    res.status(200).json({
      success:true,
      user
    })
  })

// forgot password

exports.forgot = asyncErr(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    console.log(user);
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
    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save()
    sendToken(user, 200, res);
  });