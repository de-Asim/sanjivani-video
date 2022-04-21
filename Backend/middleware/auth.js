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

    if(!userData){
        return next(new ErrorHandler("please login to access",401))
    }
    const profile = req.cookies.profile
    if(!profile){
        req.user = await User.findById(userData.id,{name:1,email:1,role:1,})
        if(!req.user){
            return next(new ErrorHandler("please login to access",401))
        }
        if(req.user.role === "blocked"){
            return next(new ErrorHandler("user is blocked",401))
        }
    }
    else{
        req.user={
            ...profile,
            _id:userData.id
        }
        if(profile.role === "blocked"){
            return next(new ErrorHandler("user is blocked",401))
        }
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