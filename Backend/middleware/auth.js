const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const asyncErr = require("./asyncErr");

exports.isAuth = asyncErr(async(req,res,next)=>{
    const token = req.cookies.jwt;
    if(!token){
        return next(new ErrorHandler("please login to access",401))
    }
    const userData = jwt.verify(token,process.env.SECRET_KEY);
    req.user = await User.findById(userData.id)
    if(!req.user){
        return next(new ErrorHandler("please login to access",401))
    }

    next();
})

exports.isAdmin = asyncErr(async(req,res,next)=>{
    const role = req.user.role;
    if(role !== "admin"){
        return next(new ErrorHandler("you don't have permission to visit this page",401))
    }
    next()
})