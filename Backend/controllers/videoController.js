const Video = require("../models/videoModel")
const asyncErr = require("../middleware/asyncErr");
const ErrorHandler = require("../utils/errorHandler");
const ApiFeature = require("../utils/apiFeatures");
const UserLike = require("../models/likeModel");
const UserDislike = require("../models/dislikeModel");

// post video
    exports.uploadVideo= asyncErr(async(req,res,next)=>{
        if(!req.files){
            return next(new ErrorHandler('file upload failed',400))
        }
        const {title,description,category,privacy,}=req.body
        const video =await Video.create({
            title,
            description,
            category,
            privacy,
            uploadedBy:req.user._id,
            link:req.files.video[0].path,
            thumbnail:req.files.thumbnail[0].path
        }) 
        res.status(201).json({
            video
        })
    })

// get videos
exports.getAllVideos=asyncErr(async(req,res,next)=>{
    const apiFeature = new ApiFeature(Video.find(), req.query).category().search().pagination();
    let videos = await apiFeature.query;
    res.status(200).json({
        success:true,
        videos
    })
})

// get single video
exports.getVideo = asyncErr(async(req,res,next)=>{
    const videoId = req.params.videoId
    const video = await Video.findOne({_id:videoId})
    if(!video){
        return next(new ErrorHandler('video not found',404))
    }
    console.log(video);
    video.views++;
    await video.save({validateBeforeSave:false})
    res.status(200).json({
        success:true,
        video
    })
})

// like video
exports.likeVideo = asyncErr(async(req,res,next)=>{
    const user = req.user
    const videoId = req.params.videoId
    const video = await Video.findOne({_id:videoId})
    if(!video){
        return next(new ErrorHandler('video not found',404))
    }
    let userLikedVideos = await UserLike.findOne({user:user._id})
    let userDislikedVideos = await UserDislike.findOne({user:user._id})
    if(!userLikedVideos){
        userLikedVideos = await UserLike.create({
            user:user._id,
        })
    }
    if(userLikedVideos.likedVideos.includes(videoId)){
        let index=userLikedVideos.likedVideos.indexOf(videoId)
        userLikedVideos.likedVideos.splice(index, 1);
        await userLikedVideos.save({validateBeforeSave:false})
        video.likes--
        await video.save({validateBeforeSave:false})
    }
    else{
        if(userDislikedVideos && userDislikedVideos.dislikedVideos.includes(videoId)){
            let index=userDislikedVideos.dislikedVideos.indexOf(videoId)
            userDislikedVideos.dislikedVideos.splice(index, 1);
            await userDislikedVideos.save({validateBeforeSave:false})
            video.dislikes--
        }
        video.likes++
        userLikedVideos.likedVideos.push(videoId)
        await userLikedVideos.save({validateBeforeSave:false})
        await video.save({validateBeforeSave:false})
    }

    res.status(201).json({
        success:true,
        video
    })
})

// dislike video
exports.dislikeVideo = asyncErr(async(req,res,next)=>{
    const user = req.user
    const videoId = req.params.videoId
    const video = await Video.findOne({_id:videoId})
    if(!video){
        return next(new ErrorHandler('video not found',404))
    }
    let userLikedVideos = await UserLike.findOne({user:user._id})
    let userDislikedVideos = await UserDislike.findOne({user:user._id})
    if(!userDislikedVideos){
        userDislikedVideos = await UserDislike.create({
            user:user._id,
        })
    }
    if(userDislikedVideos.dislikedVideos.includes(videoId)){
        let index=userDislikedVideos.dislikedVideos.indexOf(videoId)
        userDislikedVideos.dislikedVideos.splice(index, 1);
        await userDislikedVideos.save({validateBeforeSave:false})
        video.dislikes--
        await video.save({validateBeforeSave:false})
    }
    else{
        if(userLikedVideos && userLikedVideos.likedVideos.includes(videoId)){
            let index=userLikedVideos.likedVideos.indexOf(videoId)
            userLikedVideos.likedVideos.splice(index, 1);
            await userLikedVideos.save({validateBeforeSave:false})
            video.likes--
        }
        video.dislikes++
        userDislikedVideos.dislikedVideos.push(videoId)
        await userDislikedVideos.save({validateBeforeSave:false})
        await video.save({validateBeforeSave:false})
    }

    res.status(201).json({
        success:true,
        video
    })
})